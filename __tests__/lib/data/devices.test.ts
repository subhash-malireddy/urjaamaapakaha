import { db } from "@/lib/db";
import { turnOnDevice, turnOffDevice } from "@/lib/data/devices";
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";
import * as utils from "@/lib/utils";

// Mock the utils module to mock the simulateApiCall function
jest.mock("@/lib/utils", () => ({
  simulateApiCall: jest.fn().mockResolvedValue({
    usage: { today_energy: 42 },
  }),
}));

const mockDB = db as unknown as DeepMockProxy<PrismaClient>;

describe("Device data functions", () => {
  describe("turnOnDevice", () => {
    // Common test data
    const deviceId = "device-123";
    const deviceIp = "192.168.0.143";
    const userEmail = "user@example.com";
    const mockUsageId = BigInt(123);
    const mockCurrentDate = new Date();

    // Helper function to create mock usage record
    const createMockUsageRecord = (estimatedUseTime: Date | null = null) => ({
      id: mockUsageId,
      user_email: userEmail,
      device_id: deviceId,
      start_date: mockCurrentDate,
      end_date: mockCurrentDate,
      estimated_use_time: estimatedUseTime,
      consumption: 42, // Simplified
      charge: 0, // Simplified
    });

    // Helper function to create mock active device record
    const createMockActiveDeviceRecord = (
      estimatedUseTime: Date | null = null,
    ) => ({
      device_id: deviceId,
      usage_record_id: mockUsageId,
      usage: createMockUsageRecord(estimatedUseTime),
      device: {
        id: deviceId,
        mac_address: "00:11:22:33:44:55",
        ip_address: "192.168.1.100",
        alias: "Test Device",
        is_archived: false,
        previous_aliases: [],
      },
    });

    // Helper function to setup transaction mock
    const setupTransactionMock = () => {
      mockDB.$transaction.mockImplementation(async (callback: any) => {
        if (typeof callback === "function") {
          return callback(mockDB);
        }
        return Promise.resolve([]);
      });
    };

    // Reset all mocks before each test
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully turn on a device", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.usage.create.mockResolvedValueOnce(createMockUsageRecord() as any);
      mockDB.active_device.create.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );

      // Call the function under test
      const result = await turnOnDevice(deviceId, deviceIp, userEmail);

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
      // Setup estimated use time
      const estimatedUseTime = new Date(mockCurrentDate.getTime() + 3600000); // 1 hour later

      // Setup mocks
      setupTransactionMock();
      mockDB.usage.create.mockResolvedValueOnce(
        createMockUsageRecord(estimatedUseTime) as any,
      );
      mockDB.active_device.create.mockResolvedValueOnce(
        createMockActiveDeviceRecord(estimatedUseTime) as any,
      );

      // Call the function under test
      const result = await turnOnDevice(
        deviceId,
        deviceIp,
        userEmail,
        estimatedUseTime,
      );

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

    it("should use fetch API for specific IP address 192.168.0.190", async () => {
      // Special IP that should use fetch
      const specialIp = "192.168.0.190";

      // Setup mocks
      setupTransactionMock();
      mockDB.usage.create.mockResolvedValueOnce(createMockUsageRecord() as any);
      mockDB.active_device.create.mockResolvedValueOnce({} as any);

      // Mock fetch to mock its behavior
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          usage: { today_energy: 42 },
        }),
      } as any);

      // Set environment variables
      process.env.URJ_FSFY_API = "http://api.example.com";
      process.env.URJ_FSFY_API_USER = "testuser";
      process.env.URJ_FSFY_API_PWD = "testpass";

      // Call the function
      await turnOnDevice(deviceId, specialIp, userEmail);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        `http://api.example.com/on/${specialIp}`,
        {
          cache: "no-cache",
          headers: {
            "x-forwarded-authybasic": expect.stringContaining("Basic "),
          },
        },
      );
    });

    it("should handle errors and throw with a descriptive message", async () => {
      // Setup error scenario
      const errorMessage = "My Custom Database connection error";
      const dbErrorInstance = new Error(errorMessage);
      mockDB.$transaction.mockRejectedValueOnce(dbErrorInstance);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call the function and expect it to throw
      await expect(turnOnDevice(deviceId, deviceIp, userEmail)).rejects.toThrow(
        `Failed to turn on device: ${errorMessage}`,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error turning on device:",
        dbErrorInstance,
      );

      // Restore the original console.error
      consoleErrorSpy.mockRestore();
    });

    it("should handle unknown errors and provide a generic message", async () => {
      // Create an error without a message property
      const unknownError = "This should trigger unknown error";
      mockDB.$transaction.mockRejectedValueOnce(unknownError);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call the function and expect it to throw with a generic message
      await expect(turnOnDevice(deviceId, deviceIp, userEmail)).rejects.toThrow(
        "Failed to turn on device: Unknown error",
      );

      // Verify console.error was called with the unknown error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error turning on device:",
        unknownError,
      );

      // Restore the original console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe("turnOffDevice", () => {
    // Common test data
    const deviceId = "device-123";
    const deviceIp = "192.168.0.143";
    const mockUsageId = BigInt(123);
    const mockCurrentDate = new Date();
    const mockInitialConsumption = 42;
    const mockFinalConsumption = 100;

    // Helper function to create mock usage record
    const createMockUsageRecord = () => ({
      id: mockUsageId,
      user_email: "user@example.com",
      device_id: deviceId,
      start_date: mockCurrentDate,
      end_date: mockCurrentDate,
      estimated_use_time: null,
      consumption: mockInitialConsumption,
      charge: 0,
    });

    // Helper function to create mock active device record
    const createMockActiveDeviceRecord = () => ({
      device_id: deviceId,
      usage_record_id: mockUsageId,
      usage: createMockUsageRecord(),
      device: {
        id: deviceId,
        mac_address: "00:11:22:33:44:55",
        ip_address: "192.168.1.100",
        alias: "Test Device",
        is_archived: false,
        previous_aliases: [],
      },
    });

    // Helper function to setup transaction mock
    const setupTransactionMock = () => {
      mockDB.$transaction.mockImplementation(async (callback: any) => {
        if (typeof callback === "function") {
          return callback(mockDB);
        }
        return Promise.resolve([]);
      });
    };

    // Reset all mocks before each test
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully turn off a device", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );
      mockDB.usage.update.mockResolvedValueOnce({
        ...createMockUsageRecord(),
        end_date: mockCurrentDate,
        consumption: mockFinalConsumption - mockInitialConsumption,
      } as any);
      mockDB.active_device.delete.mockResolvedValueOnce({} as any);

      jest.spyOn(utils, "simulateApiCall").mockResolvedValueOnce({
        usage: { today_energy: mockFinalConsumption },
      } as any);

      // Call the function under test
      const result = await turnOffDevice(deviceId, deviceIp);

      // Assert the transaction was called
      expect(db.$transaction).toHaveBeenCalledTimes(1);

      // Assert that active_device.findFirst was called with correct parameters
      expect(db.active_device.findFirst).toHaveBeenCalledWith({
        where: { device_id: deviceId },
        include: {
          usage: true,
          device: true,
        },
      });

      // Assert that usage.update was called with correct parameters
      expect(db.usage.update).toHaveBeenCalledWith({
        where: { id: mockUsageId },
        data: {
          end_date: expect.any(Date),
          consumption: mockFinalConsumption - mockInitialConsumption,
        },
      });

      // Assert that active_device.delete was called with correct parameters
      expect(db.active_device.delete).toHaveBeenCalledWith({
        where: { device_id: deviceId },
      });

      // Assert the returned result matches our expected structure
      expect(result).toEqual(
        expect.objectContaining({
          device_id: deviceId,
          usage_record_id: mockUsageId,
          usage: expect.objectContaining({
            id: mockUsageId,
            end_date: expect.any(Date),
            consumption: mockFinalConsumption - mockInitialConsumption,
          }),
        }),
      );
    });

    it("should throw error when device is not active", async () => {
      // Setup mock to return null for inactive device
      mockDB.active_device.findFirst.mockResolvedValueOnce(null);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call the function and expect it to throw
      await expect(turnOffDevice(deviceId, deviceIp)).rejects.toThrow(
        "Device is not currently active or missing usage record",
      );

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Verify no other operations were performed
      expect(db.$transaction).not.toHaveBeenCalled();
      expect(utils.simulateApiCall).not.toHaveBeenCalled();
      expect(db.usage.update).not.toHaveBeenCalled();
      expect(db.active_device.delete).not.toHaveBeenCalled();

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it("should use fetch API for specific IP address 192.168.0.190", async () => {
      // Special IP that should use fetch
      const specialIp = "192.168.0.190";

      // Setup mocks
      setupTransactionMock();
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );
      mockDB.usage.update.mockResolvedValueOnce({
        ...createMockUsageRecord(),
        end_date: mockCurrentDate,
        consumption: mockFinalConsumption - mockInitialConsumption,
      } as any);
      mockDB.active_device.delete.mockResolvedValueOnce({} as any);

      // Mock fetch to mock its behavior
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          usage: { today_energy: mockFinalConsumption },
        }),
      } as any);

      // Set environment variables
      process.env.URJ_FSFY_API = "http://api.example.com";
      process.env.URJ_FSFY_API_USER = "testuser";
      process.env.URJ_FSFY_API_PWD = "testpass";

      // Call the function
      await turnOffDevice(deviceId, specialIp);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        `http://api.example.com/off/${specialIp}`,
        {
          cache: "no-cache",
          headers: {
            "x-forwarded-authybasic": expect.stringContaining("Basic "),
          },
        },
      );

      // Verify simulateApiCall was not called
      expect(utils.simulateApiCall).not.toHaveBeenCalled();
    });

    it("should handle database errors and throw with a descriptive message", async () => {
      // Setup mocks for the initial active device query
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );

      // Setup error scenario in transaction
      const errorMessage = "Database connection error";
      const dbErrorInstance = new Error(errorMessage);
      mockDB.$transaction.mockRejectedValueOnce(dbErrorInstance);

      // Mock the API call to ensure it's not the source of error
      jest.spyOn(utils, "simulateApiCall").mockResolvedValueOnce({
        usage: { today_energy: mockFinalConsumption },
      } as any);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call the function and expect it to throw
      await expect(turnOffDevice(deviceId, deviceIp)).rejects.toThrow(
        `Failed to turn off device: ${errorMessage}`,
      );

      // Verify error was logged correctly
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error turning off device:",
        dbErrorInstance,
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it("should handle unknown errors and provide a generic message", async () => {
      // Setup mocks for the initial active device query
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );

      // Create an error without a message property
      const unknownError = "This should trigger unknown error";
      mockDB.$transaction.mockRejectedValueOnce(unknownError);

      // Mock the API call to ensure it's not the source of error
      jest.spyOn(utils, "simulateApiCall").mockResolvedValueOnce({
        usage: { today_energy: mockFinalConsumption },
      } as any);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call the function and expect it to throw with a generic message
      await expect(turnOffDevice(deviceId, deviceIp)).rejects.toThrow(
        "Failed to turn off device: Unknown error",
      );

      // Verify error was logged with the unknown error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error turning off device:",
        unknownError,
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
