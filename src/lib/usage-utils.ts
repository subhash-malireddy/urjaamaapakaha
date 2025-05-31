import { Prisma } from "@prisma/client";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  startOfDay,
} from "date-fns";
import { roundUpTwoDecimals } from "./utils";

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
// * Tested along with getUsageDataAction
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
    const consumptionValue = consumption.toNumber();
    const consumptionValueInKWh = roundUpTwoDecimals(consumptionValue / 1000);
    const periodStart = getPeriodStart(period, timePeriod, startDate);
    const periodKey = periodStart.toISOString();

    // Update total consumption
    const totalEntry = totalConsumptionMap.get(periodKey) || {
      date: periodStart,
      consumption: 0,
    };
    totalEntry.consumption = totalEntry.consumption + consumptionValueInKWh;
    totalConsumptionMap.set(periodKey, totalEntry);

    // Update user consumption if it matches the current user
    if (dataUserEmail === userEmail) {
      const userEntry = userConsumptionMap.get(periodKey) || {
        date: periodStart,
        consumption: 0,
      };
      userEntry.consumption = userEntry.consumption + consumptionValueInKWh;
      userConsumptionMap.set(periodKey, userEntry);
    }
  });

  return {
    userConsumption: Array.from(userConsumptionMap.values()),
    totalConsumption: Array.from(totalConsumptionMap.values()),
  };
}

// * Tested along with getUsageDataAction
export function getPeriodStart(
  date: Date,
  timePeriod: TimePeriod,
  startDate: Date,
): Date {
  switch (timePeriod) {
    case "current month":
      return startOfWeek(date) < startDate ? startDate : startOfWeek(date);
    case "current week":
      return startOfDay(date) < startDate ? startDate : startOfDay(date);
    case "current billing period":
      return startOfMonth(date) < startDate ? startDate : startOfMonth(date);
    default:
      return date;
  }
}
