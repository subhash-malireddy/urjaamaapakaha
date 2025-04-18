import {
  areDatesEqualToMinute,
  dateToLocalISOString,
  isDateInFuture,
  normalizeToMinute,
} from "@/lib/utils";

describe("date utils", () => {
  describe("normalizeToMinute", () => {
    it("should set seconds and milliseconds to 0", () => {
      const date = new Date(2024, 0, 1, 12, 30, 45, 500);
      const normalized = normalizeToMinute(date);

      expect(normalized.getSeconds()).toBe(0);
      expect(normalized.getMilliseconds()).toBe(0);
      expect(normalized.getMinutes()).toBe(30);
      expect(normalized.getHours()).toBe(12);
    });
  });

  describe("dateToLocalISOString", () => {
    // We need to export this function for testing or test it indirectly
    it("should adjust for timezone offset", () => {
      const testDate = new Date(2024, 0, 1, 12, 30, 0, 0);
      const result = dateToLocalISOString(testDate);

      // Calculate expected result manually
      const expectedTimestamp =
        testDate.getTime() - testDate.getTimezoneOffset() * 60000;
      const expected = new Date(expectedTimestamp).toISOString();

      expect(result).toBe(expected);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/);
    });
  });

  describe("areDatesEqualToMinute", () => {
    it("should return true for dates with same year, month, day, hour, and minute", () => {
      const date1 = new Date(2024, 0, 1, 12, 30, 45, 500);
      const date2 = new Date(2024, 0, 1, 12, 30, 0, 0);

      expect(areDatesEqualToMinute(date1, date2)).toBe(true);
    });

    it("should return false for dates with different minutes", () => {
      const date1 = new Date(2024, 0, 1, 12, 30, 0, 0);
      const date2 = new Date(2024, 0, 1, 12, 31, 0, 0);

      expect(areDatesEqualToMinute(date1, date2)).toBe(false);
    });
  });

  describe("isDateInFuture", () => {
    it("should return true for date in future", () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 1);

      expect(isDateInFuture(futureDate)).toBe(true);
    });

    it("should return false for same date (upto minute)", () => {
      const now = new Date();

      expect(isDateInFuture(now)).toBe(false);
    });

    it("should return false for past date", () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 1);

      expect(isDateInFuture(pastDate)).toBe(false);
    });
  });
});
