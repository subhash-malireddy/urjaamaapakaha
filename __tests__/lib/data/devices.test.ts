import { db } from "@/lib/db";
import { turnOnDevice } from "@/lib/data/devices";
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

// Mock the utils module to mock the simulateApiCall function
jest.mock("@/lib/utils", () => ({
  simulateApiCall: jest.fn().mockResolvedValue({
    usage: { today_energy: 42 },
  }),
}));

const mockDB = db as unknown as DeepMockProxy<PrismaClient>;

describe("Device data functions", () => {
  describe("turnOnDevice", () => {
    // Reset all mocks before each test
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully turn on a device", async () => {
      // Mock data
      const deviceId = "device-123";
      const userEmail = "user@example.com";
      const mockUsageId = BigInt(123);
      const mockCurrentDate = new Date();

      // Mock the transaction function to return the callback result
      mockDB.$transaction.mockImplementation(async (callback: any) => {
        if (typeof callback === "function") {
          return callback(mockDB);
        }
        return Promise.resolve([]);
      });

      // Mock the usage.create method with type any to avoid Decimal issues
      mockDB.usage.create.mockResolvedValueOnce({
        id: mockUsageId,
        user_email: userEmail,
        device_id: deviceId,
        start_date: mockCurrentDate,
        end_date: mockCurrentDate,
        estimated_use_time: null,
        consumption: 42, // Simplified
        charge: 0, // Simplified
      } as any);

      // Mock the active_device.create method
      mockDB.active_device.create.mockResolvedValueOnce({
        device_id: deviceId,
        usage_record_id: mockUsageId,
        usage: {
          id: mockUsageId,
          user_email: userEmail,
          device_id: deviceId,
          start_date: mockCurrentDate,
          end_date: mockCurrentDate,
          estimated_use_time: null,
          consumption: 42, // Simplified
          charge: 0, // Simplified
        },
        device: {
          id: deviceId,
          mac_address: "00:11:22:33:44:55",
          ip_address: "192.168.1.100",
          alias: "Test Device",
          is_archived: false,
          previous_aliases: [],
        },
      } as any);

      // Call the function under test
      const result = await turnOnDevice(deviceId, userEmail);

      // Assert the transaction was called
      expect(db.$transaction).toHaveBeenCalledTimes(1);

      // Assert that usage.create was called with the correct parameters
      expect(db.usage.create).toHaveBeenCalledWith({
        data: {
          user_email: userEmail,
          device_id: deviceId,
          start_date: expect.any(Date),
          end_date: expect.any(Date),
          estimated_use_time: undefined,
          consumption: expect.anything(), // Simplified to avoid Decimal type issues
          charge: expect.anything(), // Simplified to avoid Decimal type issues
        },
      });

      // Assert that active_device.create was called with the correct parameters
      expect(db.active_device.create).toHaveBeenCalledWith({
        data: {
          device_id: deviceId,
          usage_record_id: mockUsageId,
        },
        include: {
          usage: true,
          device: true,
        },
      });

      // Assert the returned result matches our expected structure
      expect(result).toEqual(
        expect.objectContaining({
          device_id: deviceId,
          usage_record_id: mockUsageId,
          usage: expect.objectContaining({
            id: mockUsageId,
            user_email: userEmail,
            device_id: deviceId,
          }),
          device: expect.objectContaining({
            id: deviceId,
            alias: "Test Device",
          }),
        }),
      );
    });

    it("should successfully turn on a device with estimated use time", async () => {
      // Mock data
      const deviceId = "device-123";
      const userEmail = "user@example.com";
      const mockUsageId = BigInt(123);
      const mockCurrentDate = new Date();
      const estimatedUseTime = new Date(mockCurrentDate.getTime() + 3600000); // 1 hour later

      // Mock the transaction function
      mockDB.$transaction.mockImplementation(async (callback: any) => {
        if (typeof callback === "function") {
          return callback(mockDB);
        }
        return Promise.resolve([]);
      });

      // Mock the usage.create method
      mockDB.usage.create.mockResolvedValueOnce({
        id: mockUsageId,
        user_email: userEmail,
        device_id: deviceId,
        start_date: mockCurrentDate,
        end_date: mockCurrentDate,
        estimated_use_time: estimatedUseTime,
        consumption: 42, // Simplified
        charge: 0, // Simplified
      } as any);

      // Mock the active_device.create method
      mockDB.active_device.create.mockResolvedValueOnce({
        device_id: deviceId,
        usage_record_id: mockUsageId,
        usage: {
          id: mockUsageId,
          user_email: userEmail,
          device_id: deviceId,
          start_date: mockCurrentDate,
          end_date: mockCurrentDate,
          estimated_use_time: estimatedUseTime,
          consumption: 42, // Simplified
          charge: 0, // Simplified
        },
        device: {
          id: deviceId,
          mac_address: "00:11:22:33:44:55",
          ip_address: "192.168.1.100",
          alias: "Test Device",
          is_archived: false,
          previous_aliases: [],
        },
      } as any);

      // Call the function under test
      const result = await turnOnDevice(deviceId, userEmail, estimatedUseTime);

      // Assert that usage.create was called with the correct parameters
      expect(db.usage.create).toHaveBeenCalledWith({
        data: {
          user_email: userEmail,
          device_id: deviceId,
          start_date: expect.any(Date),
          end_date: expect.any(Date),
          estimated_use_time: estimatedUseTime,
          consumption: expect.anything(),
          charge: expect.anything(),
        },
      });

      // Verify the estimated use time in the result
      expect(result.usage.estimated_use_time).toEqual(estimatedUseTime);
    });

    it("should handle errors and throw with a descriptive message", async () => {
      // Mock data
      const deviceId = "device-123";
      const userEmail = "user@example.com";
      const errorMessage = "My Custom Database connection error";

      // Mock the transaction function to throw an error
      mockDB.$transaction.mockRejectedValueOnce(new Error(errorMessage));
      //let's spyon console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      // Call the function and expect it to throw
      await expect(turnOnDevice(deviceId, userEmail)).rejects.toThrow(
        `Failed to turn on device: ${errorMessage}`,
      );
      // Restore the original console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
