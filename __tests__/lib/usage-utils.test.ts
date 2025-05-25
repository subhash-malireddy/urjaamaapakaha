import {
  getCurrentWeekRange,
  getCurrentMonthRange,
  getCurrentBillingPeriodRange,
  getDateRangeForTimePeriod,
  type TimePeriod,
} from "@/lib/usage-utils";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

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
});
