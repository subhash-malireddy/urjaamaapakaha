import {
  areDatesEqualToMinute,
  compareToMinutePrecision,
  dateToLocalISOString,
  getCurrentDatePlusEightHours,
  getCurrentDatePlusOneMin,
  getDateTimeLocalValue,
  isDateInFuture,
  isWithinEightHours,
  isWithinEightHoursFromDate,
  parseDateTimeLocalInput,
  // normalizeToMinute,
  sliceISOStringUptoMinute,
  toUTCMinutePrecision,
} from "@/lib/utils";

describe("date utils", () => {
  const oneMin = 60 * 1000;
  const oneHour = 60 * oneMin;

  // describe("normalizeToMinute", () => {
  //   it("should set seconds and milliseconds to 0", () => {
  //     const date = new Date(2024, 0, 1, 12, 30, 45, 500);
  //     const normalized = normalizeToMinute(date);

  //     expect(normalized.getSeconds()).toBe(0);
  //     expect(normalized.getMilliseconds()).toBe(0);
  //     expect(normalized.getMinutes()).toBe(30);
  //     expect(normalized.getHours()).toBe(12);
  //   });
  // });

  describe("toUTCMinutePrecision", () => {
    it("should correctly convert a local date to UTC timestamp with minute precision", () => {
      // Create a date with known values in local time
      const testDate = new Date(2024, 5, 15, 14, 30, 45, 500); // June 15, 2024, 14:30:45.500 local time

      // Calculate the expected UTC timestamp manually for comparison
      const expectedTimestamp = Date.UTC(2024, 5, 15, 14, 30);

      // Call the function
      const result = toUTCMinutePrecision(testDate);

      // Verify the result matches our expected timestamp
      expect(result).toBe(expectedTimestamp);

      // Verify seconds and milliseconds are truncated
      const resultDate = new Date(result);
      expect(resultDate.getUTCSeconds()).toBe(0);
      expect(resultDate.getUTCMilliseconds()).toBe(0);

      // Verify year, month, day, hour, minute are preserved
      expect(resultDate.getUTCFullYear()).toBe(2024);
      expect(resultDate.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(resultDate.getUTCDate()).toBe(15);
      expect(resultDate.getUTCHours()).toBe(14);
      expect(resultDate.getUTCMinutes()).toBe(30);
    });
  });

  describe("compareToMinutePrecision", () => {
    it("should return a positive number when date1 is later than date2", () => {
      const date1 = new Date(2024, 0, 1, 12, 30, 0, 0); // Jan 1, 2024, 12:30:00
      const date2 = new Date(2024, 0, 1, 10, 15, 0, 0); // Jan 1, 2024, 10:15:00

      const result = compareToMinutePrecision(date1, date2);

      expect(result).toBeGreaterThan(0);

      // We can also verify the exact difference in milliseconds
      const expectedDiff = 12 * 60 + 30 - (10 * 60 + 15);
      const expectedMilliseconds = expectedDiff * 60 * 1000;
      expect(result).toBe(expectedMilliseconds);
    });

    it("should return a negative number when date1 is earlier than date2", () => {
      const date1 = new Date(2024, 0, 1, 10, 15, 0, 0); // Jan 1, 2024, 10:15:00
      const date2 = new Date(2024, 0, 1, 12, 30, 0, 0); // Jan 1, 2024, 12:30:00

      const result = compareToMinutePrecision(date1, date2);

      expect(result).toBeLessThan(0);

      // We can also verify the exact difference in milliseconds
      const expectedDiff = 10 * 60 + 15 - (12 * 60 + 30);
      const expectedMilliseconds = expectedDiff * 60 * 1000;
      expect(result).toBe(expectedMilliseconds);
    });

    it("should return zero when both dates are the same minute but different seconds/milliseconds", () => {
      const date1 = new Date(2024, 0, 1, 12, 30, 15, 200); // Jan 1, 2024, 12:30:15.200
      const date2 = new Date(2024, 0, 1, 12, 30, 45, 800); // Jan 1, 2024, 12:30:45.800

      const result = compareToMinutePrecision(date1, date2);

      expect(result).toBe(0);
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

  describe("parseDateTimeLocalInput", () => {
    it("should return current date when input string is empty", () => {
      const mockCurrentDate = new Date("2024-01-15T10:30:00");
      const globalDateSpy = jest
        .spyOn(global, "Date")
        .mockImplementationOnce(() => mockCurrentDate);

      const result = parseDateTimeLocalInput("");

      expect(result).toEqual(mockCurrentDate);

      globalDateSpy.mockRestore();
    });

    it("should correctly parse a valid date-time local string", () => {
      // Create a valid date-time local string in the format YYYY-MM-DDTHH:MM
      const dateTimeStr = "2024-06-15T14:30";

      // Expected date object that should be constructed from the string
      const expectedDate = new Date("2024-06-15T14:30");

      // Call the function
      const result = parseDateTimeLocalInput(dateTimeStr);

      // Verify the result is a Date object
      expect(result).toBeInstanceOf(Date);

      // Verify year, month, day, hours, and minutes match expected values
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5); // June is month index 5
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);

      // Verify time equality (comparing timestamps)
      expect(result.getTime()).toBe(expectedDate.getTime());
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

  describe("isWithinEightHoursFromDate", () => {
    it("should return true when givenDate is earlier than 8 hours from fromDate", () => {
      const fromDate = new Date(2024, 0, 1, 12, 0, 0); // Jan 1, 2024, 12:00:00
      const sixHoursLater = new Date(2024, 0, 1, 18, 0, 0); // Jan 1, 2024, 18:00:00 (6 hours later)

      const result = isWithinEightHoursFromDate(sixHoursLater, fromDate);

      expect(result).toBe(true);
    });

    it("should return true when givenDate is exactly at 8 hours from fromDate", () => {
      const fromDate = new Date("2024-01-01T10:00:00");
      const exactlyEightHoursLater = new Date("2024-01-01T18:00:00");

      expect(isWithinEightHoursFromDate(exactlyEightHoursLater, fromDate)).toBe(
        true,
      );

      // Also verify with manual calculation
      const eightHours = 8 * 60 * 60 * 1000;
      const calculatedDate = new Date(fromDate.getTime() + eightHours);
      expect(calculatedDate.getTime()).toBe(exactlyEightHoursLater.getTime());
    });

    it("should return false when givenDate is later than 8 hours from fromDate", () => {
      const fromDate = new Date(2024, 0, 1, 12, 0); // Jan 1, 2024, 12:00
      const nineHoursLater = new Date(2024, 0, 1, 21, 1); // Jan 1, 2024, 21:01 (9 hours and 1 minute later)

      expect(isWithinEightHoursFromDate(nineHoursLater, fromDate)).toBe(false);
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
