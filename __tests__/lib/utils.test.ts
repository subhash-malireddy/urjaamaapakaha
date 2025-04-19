import {
  areDatesEqualToMinute,
  dateToLocalISOString,
  getCurrentDatePlusEightHours,
  getCurrentDatePlusOneMin,
  getDateTimeLocalValue,
  isDateInFuture,
  isWithinEightHours,
  normalizeToMinute,
  sliceISOStringUptoMinute,
} from "@/lib/utils";

describe("date utils", () => {
  const oneMin = 60 * 1000;
  const oneHour = 60 * oneMin;

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

  describe("sliceISOStringUptoMinute", () => {
    it("should handle ISO strings without seconds or milliseconds", () => {
      // Test with an ISO string that only has minutes
      const isoString = "2024-01-01T12:30Z";
      const result = sliceISOStringUptoMinute(isoString);

      expect(result).toBe("2024-01-01T12:30");
    });
  });

  describe("getDateTimeLocalValue", () => {
    it("should return formatted date-time string in YYYY-MM-DDTHH:MM format", () => {
      // Test with a specific date
      const testDate = new Date(2024, 0, 1, 12, 30, 45, 500);
      const result = getDateTimeLocalValue(testDate);

      // Calculate expected result
      const tzOffset = testDate.getTimezoneOffset();
      const expectedTimestamp = testDate.getTime() - tzOffset * 60000;
      const expectedISOString = new Date(expectedTimestamp).toISOString();
      const expected = expectedISOString.slice(0, 16);

      expect(result).toBe(expected);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it("should return empty string for null date", () => {
      const result = getDateTimeLocalValue(null);

      expect(result).toBe("");
    });
  });

  describe("getCurrentDatePlusOneMin", () => {
    it("should return a date one minute in the future", () => {
      const mockNowReturn = new Date("2024-1-1");
      //we need this because mockNowReturn will be mutated inside the function.
      const forAssertingResult = new Date("2024-1-1");
      // global.Date = jest.fn(() => mockNow) as unknown as DateConstructor;
      const globalDateSpy = jest
        .spyOn(global, "Date")
        .mockImplementationOnce(() => mockNowReturn);
      const result = getCurrentDatePlusOneMin();

      // Verify one minute was added
      expect(result.getTime()).toBe(forAssertingResult.getTime() + oneMin);

      globalDateSpy.mockRestore();
    });
  });

  describe("getCurrentDatePlusEightHours", () => {
    it("should return a date eight hours in the future", () => {
      const mockNowReturn = new Date("2024-1-1");
      //we need this because mockNowReturn will be mutated inside the function.
      const forAssertingResult = new Date("2024-1-1");
      const globalDateSpy = jest
        .spyOn(global, "Date")
        .mockImplementationOnce(() => mockNowReturn);
      const result = getCurrentDatePlusEightHours();

      // Verify one minute was added
      forAssertingResult.setHours(forAssertingResult.getHours() + 8);
      expect(result.getTime()).toBe(forAssertingResult.getTime());

      globalDateSpy.mockRestore();
    });
  });

  describe("isWithinEightHours", () => {
    it("should return true for date within 8 hours from now", () => {
      const futureDate = new Date(Date.now() + 7 * oneHour);

      expect(isWithinEightHours(futureDate)).toBe(true);
    });

    it("should return true when date is exactly eight hours in the future", () => {
      const exactlyEightHoursLater = new Date(Date.now() + 8 * oneHour);

      expect(isWithinEightHours(exactlyEightHoursLater)).toBe(true);
    });

    it("should return false for date more than 8 hours from now", () => {
      const nineHoursInFuture = new Date(Date.now() + 9 * oneHour);

      expect(isWithinEightHours(nineHoursInFuture)).toBe(false);
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
