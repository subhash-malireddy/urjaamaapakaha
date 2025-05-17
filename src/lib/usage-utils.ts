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
