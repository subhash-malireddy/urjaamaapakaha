import { Prisma } from "@prisma/client";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

export type TimePeriod =
  // | "previous week"
  // | "previous month"
  // | "previous billing period" // TODO:: this could be a stretch goal
  "current week" | "current month" | "current billing period";

export const getCurrentWeekRange = () => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

  return {
    start,
    end,
    formatted: {
      start: format(start, "MMM dd, yyyy"),
      end: format(end, "MMM dd, yyyy"),
    },
  };
};

export const getCurrentMonthRange = () => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);

  return {
    start,
    end,
    formatted: {
      start: format(start, "MMM dd, yyyy"),
      end: format(end, "MMM dd, yyyy"),
    },
  };
};

export const getCurrentBillingPeriodRange = (billingStartDate: string) => {
  const today = new Date();
  const start = new Date(billingStartDate);
  const end = today;

  return {
    start,
    end,
    formatted: {
      start: format(start, "MMM dd, yyyy"),
      end: format(end, "MMM dd, yyyy"),
    },
  };
};

export const getDateRangeForTimePeriod = (timePeriod: TimePeriod) => {
  let dateRange;
  switch (timePeriod) {
    case "current week":
      dateRange = getCurrentWeekRange();
      break;
    case "current month":
      dateRange = getCurrentMonthRange();
      break;
    case "current billing period":
      /* istanbul ignore next */
      if (!process.env.NEXT_PUBLIC_BILLING_START_DATE) {
        throw new Error("NEXT_PUBLIC_BILLING_START_DATE is not set");
      }
      dateRange = getCurrentBillingPeriodRange(
        process.env.NEXT_PUBLIC_BILLING_START_DATE,
      );
      break;
  }
  return dateRange;
};

interface WeeklyGroupedUsageData {
  period: Date;
  consumption: number;
  userEmail: string;
}

/**
 * Groups daily usage data into weeks
 * @param data Array of daily usage data
 * @param startDate The start date of the period
 * @returns Array of weekly usage data
 */
export function groupByWeek(
  data: {
    period: Date;
    consumption: number;
    userEmail: string;
  }[],
  startDate: Date,
): WeeklyGroupedUsageData[] {
  const grouped = data.reduce(
    (acc, curr) => {
      // Use the later date between week start and period start
      const weekStart = startOfWeek(curr.period);
      const periodStart = weekStart < startDate ? startDate : weekStart;
      const key = `${periodStart.toISOString()}-${curr.userEmail}`;

      if (!acc[key]) {
        acc[key] = {
          period: periodStart,
          consumption: 0,
          userEmail: curr.userEmail,
        };
      }
      acc[key].consumption += curr.consumption;
      return acc;
    },
    {} as Record<string, WeeklyGroupedUsageData>,
  );

  return Object.values(grouped);
}

interface MonthlyGroupedUsageData {
  period: Date;
  consumption: number;
  userEmail: string;
}

/**
 * Groups daily usage data into months
 * @param data Array of daily usage data
 * @param startDate The start date of the period
 * @returns Array of monthly usage data
 */
export function groupByMonth(
  data: {
    period: Date;
    consumption: number;
    userEmail: string;
  }[],
  startDate: Date,
): MonthlyGroupedUsageData[] {
  const grouped = data.reduce(
    (acc, curr) => {
      // Use the later date between month start and period start
      const monthStart = startOfMonth(curr.period);
      const periodStart = monthStart < startDate ? startDate : monthStart;
      const key = `${periodStart.toISOString()}-${curr.userEmail}`;

      if (!acc[key]) {
        acc[key] = {
          period: periodStart,
          consumption: 0,
          userEmail: curr.userEmail,
        };
      }
      acc[key].consumption += curr.consumption;
      return acc;
    },
    {} as Record<string, MonthlyGroupedUsageData>,
  );

  return Object.values(grouped);
}

interface ProcessedUsageData {
  userConsumption: { date: Date; consumption: number }[];
  totalConsumption: { date: Date; consumption: number }[];
}

/**
 * Further groups the usage data by user and total consumption by aggregating the consumption values by time period. Used in the getUsageDataAction function.
 * @param data - The usage data to process
 * @param timePeriod - The time period to process the data for
 * @param startDate - The start date of the period
 * @param userEmail - The email of the user to process the data for
 * @returns The processed usage data
 */
export function processUsageData(
  data: { period: Date; consumption: Prisma.Decimal; userEmail: string }[],
  timePeriod: TimePeriod,
  startDate: Date,
  userEmail: string,
): ProcessedUsageData {
  const userConsumptionMap = new Map<
    string,
    { date: Date; consumption: number }
  >();
  const totalConsumptionMap = new Map<
    string,
    { date: Date; consumption: number }
  >();

  data.forEach(({ period, consumption, userEmail: dataUserEmail }) => {
    const consumptionValue = Number(
      (Math.ceil(consumption.toNumber() * 100) / 100).toFixed(2),
    );
    const periodStart = getPeriodStart(period, timePeriod, startDate);
    const periodKey = periodStart.toISOString();

    // Update total consumption
    const totalEntry = totalConsumptionMap.get(periodKey) || {
      date: periodStart,
      consumption: 0,
    };
    totalEntry.consumption = Number(
      (
        Math.ceil((totalEntry.consumption + consumptionValue) * 100) / 100
      ).toFixed(2),
    );
    totalConsumptionMap.set(periodKey, totalEntry);

    // Update user consumption if it matches the current user
    if (dataUserEmail === userEmail) {
      const userEntry = userConsumptionMap.get(periodKey) || {
        date: periodStart,
        consumption: 0,
      };
      userEntry.consumption = Number(
        (
          Math.ceil((userEntry.consumption + consumptionValue) * 100) / 100
        ).toFixed(2),
      );
      userConsumptionMap.set(periodKey, userEntry);
    }
  });

  return {
    userConsumption: Array.from(userConsumptionMap.values()),
    totalConsumption: Array.from(totalConsumptionMap.values()),
  };
}

function getPeriodStart(
  date: Date,
  timePeriod: TimePeriod,
  startDate: Date,
): Date {
  switch (timePeriod) {
    case "current month":
      return startOfMonth(date) < startDate ? startDate : startOfMonth(date);
    case "current week":
      return startOfWeek(date) < startDate ? startDate : startOfWeek(date);
    case "current billing period":
      return startOfMonth(date) < startDate ? startDate : startOfMonth(date);
    default:
      return date;
  }
}
