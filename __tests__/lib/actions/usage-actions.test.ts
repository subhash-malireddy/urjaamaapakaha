import { auth } from "@/auth";
import { updateEstimatedTimeAction } from "@/lib/actions/usage-actions";
import { getActiveDevice } from "@/lib/data/devices";
import { updateEstimatedTime } from "@/lib/data/usage";
import { getDateTimeLocalValue, convertDateTimeLocalToUTC } from "@/lib/utils";
import { getUsageDataAction } from "@/lib/actions/usage-actions";
import { getUsageData } from "@/lib/data/usage";
import { getPeriodStart, TimePeriod } from "@/lib/usage-utils";
import { Prisma } from "@prisma/client";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));
jest.mock("@/lib/data/devices");
jest.mock("@/lib/data/usage");

jest.mock("@/lib/utils", () => {
  const actualUtils = jest.requireActual("@/lib/utils");
  return {
    ...actualUtils,
    convertDateTimeLocalToUTC: jest
      .fn()
      .mockImplementation(actualUtils.convertDateTimeLocalToUTC),
  };
});

describe("updateEstimatedTimeAction", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("authentication", () => {
    it("should return unauthorized error when user is not logged in", async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedDateTimeLocal",
        new Date(Date.now() + 3600000).toISOString(),
      );
      formData.append("timezoneOffset", "120");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Unauthorized",
        error: "Unauthorized",
      });
    });

    it("should return unauthorized error when user is not a member", async () => {
      // Mock auth to return valid session but with guest role
      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com", role: "guest" },
      });

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedDateTimeLocal",
        new Date(Date.now() + 3600000).toISOString(),
      );
      formData.append("timezoneOffset", "120");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Unauthorized",
        error: "Unauthorized",
      });
    });

    it("should return unauthorized error when user is admin but not member", async () => {
      // Mock auth to return valid session but with admin role
      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com", role: "admin" },
      });

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedDateTimeLocal",
        new Date(Date.now() + 3600000).toISOString(),
      );
      formData.append("timezoneOffset", "120");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Unauthorized",
        error: "Unauthorized",
      });
    });

    it("should proceed when user is logged in with member role", async () => {
      // Mock auth to return valid session with member role
      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com", role: "member" },
      });

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedDateTimeLocal",
        new Date(Date.now() + 3600000).toISOString(),
      );
      formData.append("timezoneOffset", "120");
      // Mock getActiveDevice to return null to isolate authentication test
      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      // We expect a different error than authentication
      expect(result.error).not.toBe("Unauthorized");
      expect(auth).toHaveBeenCalled();
    });
  });

  describe("input validation", () => {
    beforeEach(() => {
      // Mock authenticated user for all validation tests
      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com", role: "member" },
      });
    });

    it("should return error when form data has invalid types", async () => {
      const formData = new FormData();
      // Use a non-string value by creating a mock File object
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      formData.append("deviceId", mockFile);
      formData.append("estimatedDateTimeLocal", "2023-01-01T12:00");
      formData.append("timezoneOffset", "120");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Invalid form data",
        error: "Validation Error",
      });
    });

    it("should return error when date is invalid", async () => {
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedDateTimeLocal", "invalid-date");
      formData.append("timezoneOffset", "120");
      (convertDateTimeLocalToUTC as jest.Mock).mockImplementationOnce(
        () => new Date("invalid-date"),
      );
      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Invalid date format",
        error: "Validation Error",
      });
    });

    it("should return error when date is in the past", async () => {
      const pastDateMock = new Date(Date.now() - 3600000);
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedDateTimeLocal", pastDateMock.toISOString());
      formData.append(
        "timezoneOffset",
        pastDateMock.getTimezoneOffset().toString(),
      );
      (convertDateTimeLocalToUTC as jest.Mock).mockImplementationOnce(
        () => pastDateMock,
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Date must be in the future",
        error: "Validation Error",
      });
    });

    it("should return error when date is current time (same minute)", async () => {
      const now = new Date();
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedDateTimeLocal", now.toISOString());
      formData.append("timezoneOffset", now.getTimezoneOffset().toString());
      (convertDateTimeLocalToUTC as jest.Mock).mockImplementationOnce(
        () => now,
      );
      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Date must be in the future",
        error: "Validation Error",
      });
    });

    it("should accept time that is at least one minute in the future", async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 1);
      const futureUtcDate = new Date(
        futureDate.getTime() - futureDate.getTimezoneOffset() * 60000,
      );

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "timezoneOffset",
        futureDate.getTimezoneOffset().toString(),
      );
      formData.append(
        "estimatedDateTimeLocal",
        futureUtcDate.toISOString().slice(0, 16),
      );

      (convertDateTimeLocalToUTC as jest.Mock).mockImplementationOnce(
        () => futureUtcDate,
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);
      // moves ahead to fetch the active device
      expect(getActiveDevice).toHaveBeenCalledTimes(1);
      // We expect a different error than validation error (like device not found)
      expect(result.error).not.toBe("Validation Error");
    });
  });

  describe("device access", () => {
    const testEmail = "test@example.com";
    const testDeviceId = "test-device";
    const futureDate = new Date(Date.now() + 3600000);
    const dateTimeLocalValue = getDateTimeLocalValue(futureDate);

    const tzOffsetString = futureDate.getTimezoneOffset().toString();
    const convertDateTimeLocalToUTCMock =
      convertDateTimeLocalToUTC as jest.Mock;

    beforeEach(() => {
      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({
        user: { email: testEmail, role: "member" },
      });

      convertDateTimeLocalToUTCMock.mockReturnValue(futureDate);
    });

    it("should return error when device is not found", async () => {
      // Mock getActiveDevice to return null (device not found)
      (getActiveDevice as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Device is not currently in use",
        error: "Not Found",
      });
      expect(getActiveDevice).toHaveBeenCalledWith({
        where: { device_id: testDeviceId },
        include: {
          usage: {
            select: {
              id: true,
              user_email: true,
              estimated_use_time: true,
              start_date: true,
            },
          },
        },
      });
    });

    it("should return error when device belongs to another user", async () => {
      // Mock getActiveDevice to return device with different user
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: "usage-1",
          user_email: "other@example.com",
          estimated_use_time: null,
        },
      });

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "You can only update times for your own devices",
        error: "Forbidden",
      });
      // Verify that the expected check was made
      expect(auth).toHaveBeenCalled();
    });

    it("should return error when date is in future but beyond eight hours from start date", async () => {
      const now = new Date();
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: "usage-1",
          user_email: testEmail,
          estimated_use_time: null,
          start_date: now,
        },
      });
      const oneMin = 60 * 1000;
      const beyondEightHours = new Date(
        now.getTime() + 8 * 60 * oneMin + oneMin,
      ); // 8 hours + 2 minutes
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedDateTimeLocal",
        getDateTimeLocalValue(beyondEightHours),
      );
      formData.append(
        "timezoneOffset",
        beyondEightHours.getTimezoneOffset().toString(),
      );
      convertDateTimeLocalToUTCMock.mockReturnValue(beyondEightHours);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Date must be within 8 hours of the start date",
        error: "Validation Error",
      });
    });

    it("should proceed when device belongs to current user", async () => {
      // Mock getActiveDevice to return device with current user
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: "usage-1",
          user_email: testEmail,
          estimated_use_time: null,
          start_date: new Date(),
        },
      });

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      // Should not return Forbidden or Not Found errors
      expect(result.error).not.toBe("Forbidden");
      expect(result.error).not.toBe("Not Found");
    });
  });

  describe("time update", () => {
    const testEmail = "test@example.com";
    const testDeviceId = "test-device";
    const usageId = "usage-1";
    const futureTime = new Date(Date.now() + 3600000);
    const convertDateTimeLocalToUTCMock =
      convertDateTimeLocalToUTC as jest.Mock;

    beforeEach(() => {
      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({
        user: { email: testEmail, role: "member" },
      });

      convertDateTimeLocalToUTCMock.mockReturnValue(futureTime);

      // Mock getActiveDevice with valid device
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: usageId,
          user_email: testEmail,
          estimated_use_time: null,
          start_date: new Date(),
        },
      });
    });

    it("should return error when new time is same as time in the database (up to minute)", async () => {
      const oneHour = 60 * 60 * 1000;
      const baseTime = new Date(Date.now() + oneHour);
      baseTime.setSeconds(0, 0); // Set seconds to 0 for comparison
      const currentTime = new Date(baseTime);
      const newTimeWithDifferentSeconds = new Date(baseTime);
      newTimeWithDifferentSeconds.setSeconds(currentTime.getSeconds() + 30); // Different seconds, same minute
      const dateTimeLocalValue = getDateTimeLocalValue(
        newTimeWithDifferentSeconds,
      );
      const tzOffsetString = newTimeWithDifferentSeconds
        .getTimezoneOffset()
        .toString();
      // Mock device with existing Date
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: usageId,
          user_email: testEmail,
          estimated_use_time: currentTime,
        },
      });

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "No change made to the date",
        error: "Validation Error",
      });
    });

    it("should allow update when times differ by at least one minute", async () => {
      const currentTime = new Date(Date.now() + 3600000);
      const newTime = new Date(currentTime);
      newTime.setMinutes(currentTime.getMinutes() + 1);
      newTime.setSeconds(0, 0); // date comparison does not consider seconds & milliseconds.
      const dateTimeLocalValue = getDateTimeLocalValue(newTime);
      const tzOffsetString = newTime.getTimezoneOffset().toString();

      // Mock device with existing Date
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: usageId,
          user_email: testEmail,
          estimated_use_time: currentTime,
          start_date: new Date(),
        },
      });

      convertDateTimeLocalToUTCMock.mockReturnValue(newTime);

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      // Should not get validation error
      expect(updateEstimatedTime).toHaveBeenCalledWith(usageId, newTime);
      expect(result.error).toBeUndefined();
      expect(result.message).toBe("Date updated successfully");
      expect(result.updatedTime).toBe(newTime);
    });

    it("should handle database update error", async () => {
      (updateEstimatedTime as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console error

      const dateTimeLocalValue = getDateTimeLocalValue(futureTime);
      const tzOffsetString = futureTime.getTimezoneOffset().toString();

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedDateTimeLocal", dateTimeLocalValue);
      formData.append("timezoneOffset", tzOffsetString);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Database error",
        error: "Server Error",
      });
    });
  });

  describe("general error handling", () => {
    it("should return server error when date is invalid", async () => {
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedDateTimeLocal", "invalid-date");
      formData.append("timezoneOffset", "120");

      // Mock authentication failure to trigger server error
      (auth as jest.Mock).mockRejectedValue("Runtime error");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Error updating date",
        error: "Server Error",
      });
    });
  });
});

describe("getUsageDataAction", () => {
  const mockUserEmail = "test@example.com";
  const mockTimePeriod: TimePeriod = "current week";
  const mockDateRange = {
    start: new Date("2024-03-19T00:00:00Z"),
    end: new Date("2024-03-22T00:00:00Z"),
  };
  const mockDeviceId = "device-123";

  const mockUsageData = [
    {
      period: new Date("2024-03-20T00:00:00Z"),
      consumption: new Prisma.Decimal(10.12),
      userEmail: mockUserEmail,
    },
    {
      period: new Date("2024-03-21T00:00:00Z"),
      consumption: new Prisma.Decimal(20.23),
      userEmail: "other@example.com",
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("should return unauthorized error when no user session", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: null });

      const result = await getUsageDataAction(
        mockTimePeriod,
        mockDateRange,
        mockDeviceId,
      );

      expect(result).toEqual({
        message: "Unauthorized",
        error: "Unauthorized",
      });
      expect(getUsageData).not.toHaveBeenCalled();
    });
  });

  describe("data fetching and processing", () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue({
        user: { email: mockUserEmail },
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch and process usage data with device ID for current week", async () => {
      (getUsageData as jest.Mock).mockResolvedValueOnce(mockUsageData);

      const result = await getUsageDataAction(
        "current week",
        mockDateRange,
        mockDeviceId,
      );

      expect(getUsageData).toHaveBeenCalledWith({
        deviceId: mockDeviceId,
        startDate: mockDateRange.start,
        endDate: mockDateRange.end,
      });

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current week",
                mockDateRange.start,
              ), // asserting that the date is the start of the day
              consumption: 10.12,
            },
          ],
          totalConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current week",
                mockDateRange.start,
              ),
              consumption: 10.12,
            },
            {
              date: getPeriodStart(
                mockUsageData[1].period,
                "current week",
                mockDateRange.start,
              ),
              consumption: 20.23,
            },
          ],
        },
      });
    });

    it("should fetch and process usage data for current month", async () => {
      (getUsageData as jest.Mock).mockResolvedValueOnce(mockUsageData);

      const result = await getUsageDataAction(
        "current month",
        mockDateRange,
        mockDeviceId,
      );

      expect(getUsageData).toHaveBeenCalledWith({
        deviceId: mockDeviceId,
        startDate: mockDateRange.start,
        endDate: mockDateRange.end,
      });

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current month",
                mockDateRange.start,
              ),
              consumption: 10.12,
            },
          ],
          totalConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current month",
                mockDateRange.start,
              ),
              consumption: 30.35, // Aggregated: 10.12 + 20.23
            },
          ],
        },
      });
    });

    it("should fetch and process usage data for current billing period", async () => {
      (getUsageData as jest.Mock).mockResolvedValueOnce(mockUsageData);

      const result = await getUsageDataAction(
        "current billing period",
        mockDateRange,
        mockDeviceId,
      );

      expect(getUsageData).toHaveBeenCalledWith({
        deviceId: mockDeviceId,
        startDate: mockDateRange.start,
        endDate: mockDateRange.end,
      });

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current billing period",
                mockDateRange.start,
              ),
              consumption: 10.12,
            },
          ],
          totalConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                "current billing period",
                mockDateRange.start,
              ),
              consumption: 30.35, // Aggregated: 10.12 + 20.23
            },
          ],
        },
      });
    });

    it("should fetch and process usage data without device ID", async () => {
      (getUsageData as jest.Mock).mockResolvedValueOnce(mockUsageData);

      const result = await getUsageDataAction(mockTimePeriod, mockDateRange);

      expect(getUsageData).toHaveBeenCalledWith({
        deviceId: undefined,
        startDate: mockDateRange.start,
        endDate: mockDateRange.end,
      });

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                mockTimePeriod,
                mockDateRange.start,
              ),
              consumption: 10.12,
            },
          ],
          totalConsumption: [
            {
              date: getPeriodStart(
                mockUsageData[0].period,
                mockTimePeriod,
                mockDateRange.start,
              ),
              consumption: 10.12,
            },
            {
              date: getPeriodStart(
                mockUsageData[1].period,
                mockTimePeriod,
                mockDateRange.start,
              ),
              consumption: 20.23,
            },
          ],
        },
      });
    });

    it("should handle empty usage data", async () => {
      (getUsageData as jest.Mock).mockResolvedValueOnce([]);

      const result = await getUsageDataAction(
        mockTimePeriod,
        mockDateRange,
        mockDeviceId,
      );

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [],
          totalConsumption: [],
        },
      });
    });

    it("should handle usage data with only other users", async () => {
      const otherUserData = [
        {
          period: new Date("2024-03-20T00:00:00Z"),
          consumption: new Prisma.Decimal(15.5),
          userEmail: "other@example.com",
        },
      ];
      (getUsageData as jest.Mock).mockResolvedValueOnce(otherUserData);

      const result = await getUsageDataAction(
        mockTimePeriod,
        mockDateRange,
        mockDeviceId,
      );

      expect(result).toEqual({
        message: "Usage data fetched successfully",
        data: {
          userConsumption: [], // No data for current user
          totalConsumption: [
            {
              date: getPeriodStart(
                otherUserData[0].period,
                mockTimePeriod,
                mockDateRange.start,
              ),
              consumption: 15.5,
            },
          ],
        },
      });
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      (auth as jest.Mock).mockResolvedValue({
        user: { email: mockUserEmail },
      });
    });

    it("should handle database errors during data fetching", async () => {
      const mockError = new Error("Database error");
      (getUsageData as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await getUsageDataAction(
        mockTimePeriod,
        mockDateRange,
        mockDeviceId,
      );

      expect(result).toEqual({
        message: "Failed to fetch usage data",
        error: "Database error",
      });
    });

    it("should handle unknown errors during data fetching", async () => {
      (getUsageData as jest.Mock).mockRejectedValueOnce("Unknown error");

      const result = await getUsageDataAction(
        mockTimePeriod,
        mockDateRange,
        mockDeviceId,
      );

      expect(result).toEqual({
        message: "Failed to fetch usage data",
        error: "Unknown error occurred",
      });
    });
  });
});
