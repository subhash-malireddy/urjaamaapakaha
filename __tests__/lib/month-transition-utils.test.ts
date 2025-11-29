import { toSydneyTime, isMonthTransition } from "@/lib/month-transition-utils";

describe("month transition utils", () => {
  describe("toSydneyTime", () => {
    it("should convert UTC date to Sydney timezone during standard time (AEDT +11)", () => {
      // January is summer in Sydney (AEDT +11)
      const utcDate = new Date("2025-01-31T12:30:00.000Z");
      const sydneyDate = toSydneyTime(utcDate);

      // UTC 12:30 should become Sydney 23:30 (12:30 + 11 hours)
      expect(sydneyDate.getHours()).toBe(23);
      expect(sydneyDate.getMinutes()).toBe(30);
      expect(sydneyDate.getDate()).toBe(31);
      expect(sydneyDate.getMonth()).toBe(0); // January
    });

    it("should convert UTC date to Sydney timezone during daylight saving (AEST +10)", () => {
      // July is winter in Sydney (AEST +10)
      const utcDate = new Date("2025-07-15T12:30:00.000Z");
      const sydneyDate = toSydneyTime(utcDate);

      // UTC 12:30 should become Sydney 22:30 (12:30 + 10 hours)
      expect(sydneyDate.getHours()).toBe(22);
      expect(sydneyDate.getMinutes()).toBe(30);
      expect(sydneyDate.getDate()).toBe(15);
      expect(sydneyDate.getMonth()).toBe(6); // July
    });

    it("should handle date crossing midnight in Sydney", () => {
      // UTC date that crosses midnight when converted to Sydney
      const utcDate = new Date("2025-01-31T13:30:00.000Z");
      const sydneyDate = toSydneyTime(utcDate);

      // UTC 13:30 should become Sydney 00:30 next day (13:30 + 11 hours = 24:30 = 00:30 next day)
      expect(sydneyDate.getHours()).toBe(0);
      expect(sydneyDate.getMinutes()).toBe(30);
      expect(sydneyDate.getDate()).toBe(1); // February 1st
      expect(sydneyDate.getMonth()).toBe(1); // February
    });
  });

  describe("isMonthTransition", () => {
    it("should return false when start and end dates are in the same month", () => {
      // Both dates in January 2025
      const startDate = new Date("2025-01-15T10:00:00.000Z"); // Jan 15, 21:00 Sydney
      const endDate = new Date("2025-01-15T16:00:00.000Z"); // Jan 16, 03:00 Sydney

      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(false);
    });

    it("should return true when start and end dates cross month boundary", () => {
      // Start in January, end in February (Sydney time)
      const startDate = new Date("2025-01-31T12:30:00.000Z"); // Jan 31, 23:30 Sydney
      const endDate = new Date("2025-01-31T19:00:00.000Z"); // Feb 1, 06:00 Sydney

      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(true);
    });

    it("should return true when crossing from December to January", () => {
      // Cross year boundary: Dec 31 to Jan 1
      const startDate = new Date("2024-12-31T12:30:00.000Z"); // Dec 31, 23:30 Sydney
      const endDate = new Date("2024-12-31T19:00:00.000Z"); // Jan 1, 06:00 Sydney

      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(true);
    });

    it("should handle edge case with different UTC and Sydney months", () => {
      // UTC dates on same day but Sydney dates cross month boundary
      const startDate = new Date("2025-01-31T13:00:00.000Z"); // Feb 1, 00:00 Sydney
      const endDate = new Date("2025-01-31T14:00:00.000Z"); // Feb 1, 01:00 Sydney

      // Both should be in February in Sydney time
      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(false);
    });

    it("should work correctly during winter time (AEST +10)", () => {
      // July dates during winter
      const startDate = new Date("2025-07-31T13:30:00.000Z"); // Jul 31, 23:30 Sydney
      const endDate = new Date("2025-07-31T20:00:00.000Z"); // Aug 1, 06:00 Sydney

      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(true);
    });

    it("should return false for same date and time", () => {
      const sameDate = new Date("2025-01-15T12:00:00.000Z");

      const result = isMonthTransition(sameDate, sameDate);
      expect(result).toBe(false);
    });

    it("should detect month transition during normal overnight device usage", () => {
      // Typical overnight usage: device starts late at night and runs into the next month
      const startDate = new Date("2025-01-31T12:30:00.000Z"); // Jan 31, 23:30 Sydney
      const endDate = new Date("2025-01-31T19:00:00.000Z"); // Feb 1, 06:00 Sydney (6.5 hours later)

      const result = isMonthTransition(startDate, endDate);
      expect(result).toBe(true);
    });
  });
});
