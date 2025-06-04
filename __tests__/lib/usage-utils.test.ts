import {
  getCurrentWeekRange,
  getCurrentMonthRange,
  getCurrentBillingPeriodRange,
  getDateRangeForTimePeriod,
  type TimePeriod,
  getPeriodStart,
} from "@/lib/usage-utils";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
} from "date-fns";

describe("Usage Utils", () => {
  const mockToday = new Date("2024-03-15"); // A Friday

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockToday);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("getCurrentWeekRange", () => {
    it("should return correct week range starting from Sunday", () => {
      const result = getCurrentWeekRange();
      const expectedStart = startOfWeek(mockToday, { weekStartsOn: 0 });
      const expectedEnd = endOfWeek(mockToday, { weekStartsOn: 0 });

      expect(result.start).toEqual(expectedStart);
      expect(result.end).toEqual(expectedEnd);
      expect(result.formatted.start).toBe("Mar 10, 2024");
      // test if the start date is a Sunday
      expect(result.start.getDay()).toBe(0);
      expect(result.formatted.end).toBe("Mar 16, 2024");
      // test if the end date is a Saturday
      expect(result.end.getDay()).toBe(6);
    });
  });

  describe("getCurrentMonthRange", () => {
    it("should return correct month range", () => {
      const result = getCurrentMonthRange();
      const expectedStart = startOfMonth(mockToday);
      const expectedEnd = endOfMonth(mockToday);

      expect(result.start).toEqual(expectedStart);
      expect(result.end).toEqual(expectedEnd);
      expect(result.formatted.start).toBe("Mar 01, 2024");
      expect(result.formatted.end).toBe("Mar 31, 2024");
    });
  });

  describe("getCurrentBillingPeriodRange", () => {
    it("should return correct billing period range", () => {
      const billingStartDate = "01-MAR-2024";
      const result = getCurrentBillingPeriodRange(billingStartDate);

      expect(result.start).toEqual(new Date(billingStartDate));
      expect(result.end).toEqual(mockToday);
      expect(result.formatted.start).toBe("Mar 01, 2024");
      expect(result.formatted.end).toBe("Mar 15, 2024");
    });
  });

  describe("getDateRangeForTimePeriod", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_BILLING_START_DATE: "01-MAR-2024",
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it.each<TimePeriod>([
      "current week",
      "current month",
      "current billing period",
    ])("should return correct date range for %s", (timePeriod) => {
      const result = getDateRangeForTimePeriod(timePeriod);
      expect(result).toBeDefined();
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.formatted.start).toMatch(/^[A-Za-z]{3} \d{2}, \d{4}$/);
      expect(result.formatted.end).toMatch(/^[A-Za-z]{3} \d{2}, \d{4}$/);
    });
  });

  describe("getPeriodStart", () => {
    const mondayDate = new Date("2024-01-15"); // Monday, Jan 15, 2024
    const wednesdayStartDate = new Date("2024-01-10"); // Wednesday, Jan 10, 2024

    describe("current month", () => {
      it("returns startOfWeek when it is after startDate", () => {
        const result = getPeriodStart(
          mondayDate,
          "current month",
          wednesdayStartDate,
        );
        const expectedWeekStart = startOfWeek(mondayDate); // Should be Sunday, Jan 14, 2024

        expect(result).toEqual(expectedWeekStart);
        expect(result.getTime()).toBeGreaterThan(wednesdayStartDate.getTime());
      });

      it("returns startDate when startOfWeek is before startDate", () => {
        const mondayEarlier = new Date("2024-01-08"); // Monday, Jan 8, 2024
        const wednesdayLater = new Date("2024-01-10"); // Wednesday, Jan 10, 2024

        const result = getPeriodStart(
          mondayEarlier,
          "current month",
          wednesdayLater,
        );
        // startOfWeek(Monday Jan 8) = Sunday Jan 7, which is before Wednesday Jan 10

        expect(result).toBe(wednesdayLater);
      });
    });

    describe("current week", () => {
      it("returns startOfDay when it is after startDate", () => {
        const result = getPeriodStart(
          mondayDate,
          "current week",
          wednesdayStartDate,
        );
        const expectedDayStart = startOfDay(mondayDate); // Should be Monday, Jan 15, 2024 00:00:00

        expect(result).toEqual(expectedDayStart);
        expect(result.getTime()).toBeGreaterThan(wednesdayStartDate.getTime());
      });

      it("returns startDate when startOfDay is before startDate", () => {
        const mondayEarlier = new Date("2024-01-08"); // Monday, Jan 8, 2024

        const result = getPeriodStart(
          mondayEarlier,
          "current week",
          wednesdayStartDate,
        );
        // startOfDay(Monday Jan 8) is before Wednesday Jan 10

        expect(result).toBe(wednesdayStartDate);
      });
    });

    describe("current billing period", () => {
      it("returns startOfMonth when it is after startDate", () => {
        const thursdayInFebruary = new Date("2024-02-15"); // Thursday, Feb 15, 2024
        const mondayInJanuary = new Date("2024-01-15"); // Monday, Jan 15, 2024

        const result = getPeriodStart(
          thursdayInFebruary,
          "current billing period",
          mondayInJanuary,
        );
        const expectedMonthStart = startOfMonth(thursdayInFebruary); // Should be Thursday, Feb 1, 2024

        expect(result).toEqual(expectedMonthStart);
        expect(result.getTime()).toBeGreaterThan(mondayInJanuary.getTime());
      });

      it("returns startDate when startOfMonth is before startDate", () => {
        const result = getPeriodStart(
          mondayDate,
          "current billing period",
          wednesdayStartDate,
        );
        // startOfMonth(Monday Jan 15) = Monday Jan 1, which is before Wednesday Jan 10

        expect(result).toBe(wednesdayStartDate);
      });
    });

    describe("default case", () => {
      it("returns the original date for unknown time period", () => {
        const result = getPeriodStart(
          mondayDate,
          "unknown" as any,
          wednesdayStartDate,
        );

        expect(result).toBe(mondayDate);
      });
    });
  });
});
