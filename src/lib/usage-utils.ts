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
