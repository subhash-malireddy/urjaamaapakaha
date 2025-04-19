import { auth } from "@/auth";
import { updateEstimatedTimeAction } from "@/lib/actions/usage-actions";
import { getActiveDevice } from "@/lib/data/devices";
import { updateEstimatedTime } from "@/lib/data/usage";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));
jest.mock("@/lib/data/devices");
jest.mock("@/lib/data/usage");

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
        "estimatedTime",
        new Date(Date.now() + 3600000).toISOString(),
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "You must be logged in",
        error: "Unauthorized",
      });
    });

    it("should proceed when user is logged in", async () => {
      // Mock auth to return valid session
      (auth as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com" },
      });

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedTime",
        new Date(Date.now() + 3600000).toISOString(),
      );

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
        user: { email: "test@example.com" },
      });
    });

    it("should return error when deviceId is missing", async () => {
      const formData = new FormData();
      formData.append(
        "estimatedTime",
        new Date(Date.now() + 3600000).toISOString(),
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Missing required fields",
        error: "Validation Error",
      });
    });

    it("should return error when estimatedTime is missing", async () => {
      const formData = new FormData();
      formData.append("deviceId", "test-device");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Missing required fields",
        error: "Validation Error",
      });
    });

    it("should return error when date is invalid", async () => {
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedTime", "invalid-date");

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Time must be in the future",
        error: "Validation Error",
      });
    });

    it("should return error when date is in the past", async () => {
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append(
        "estimatedTime",
        new Date(Date.now() - 3600000).toISOString(),
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Time must be in the future",
        error: "Validation Error",
      });
    });

    it("should return error when date is current time (same minute)", async () => {
      const now = new Date();
      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedTime", now.toISOString());

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Time must be in the future",
        error: "Validation Error",
      });
    });

    it("should accept time that is at least one minute in the future", async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 1);

      const formData = new FormData();
      formData.append("deviceId", "test-device");
      formData.append("estimatedTime", futureDate.toISOString());

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      // We expect a different error than validation error (like device not found)
      expect(result.error).not.toBe("Validation Error");
    });
  });

  describe("device access", () => {
    const testEmail = "test@example.com";
    const testDeviceId = "test-device";
    const futureTime = new Date(Date.now() + 3600000).toISOString();

    beforeEach(() => {
      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({
        user: { email: testEmail },
      });
    });

    it("should return error when device is not found", async () => {
      // Mock getActiveDevice to return null (device not found)
      (getActiveDevice as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedTime", futureTime);

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
      formData.append("estimatedTime", futureTime);

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "You can only update times for your own devices",
        error: "Forbidden",
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
        },
      });

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedTime", futureTime);

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

    beforeEach(() => {
      // Mock authenticated user
      (auth as jest.Mock).mockResolvedValue({
        user: { email: testEmail },
      });

      // Mock getActiveDevice with valid device
      (getActiveDevice as jest.Mock).mockResolvedValue({
        device_id: testDeviceId,
        usage: {
          id: usageId,
          user_email: testEmail,
          estimated_use_time: null,
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

      // Mock device with existing time
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
      formData.append(
        "estimatedTime",
        newTimeWithDifferentSeconds.toISOString(),
      );

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "No change made to the time",
        error: "Validation Error",
      });
    });

    it("should allow update when times differ by at least one minute", async () => {
      const currentTime = new Date(Date.now() + 3600000);
      const newTime = new Date(currentTime);
      newTime.setMinutes(currentTime.getMinutes() + 1);

      // Mock device with existing time
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
      formData.append("estimatedTime", newTime.toISOString());

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      // Should not get validation error
      expect(result.error).not.toBe("Validation Error");
      expect(updateEstimatedTime).toHaveBeenCalledWith(usageId, newTime);
    });

    it("should handle database update error", async () => {
      (updateEstimatedTime as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console error

      const formData = new FormData();
      formData.append("deviceId", testDeviceId);
      formData.append("estimatedTime", futureTime.toISOString());

      const result = await updateEstimatedTimeAction({ message: "" }, formData);

      expect(result).toEqual({
        message: "Server error updating time",
        error: "Server Error",
      });
    });
  });
});
