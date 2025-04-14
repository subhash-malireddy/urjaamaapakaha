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

describe("Device data functions", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("turnOnDevice", () => {
    it("should successfully turn on a device", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.usage.create.mockResolvedValueOnce(createMockUsageRecord() as any);
      mockDB.active_device.create.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );

      // Call the function under test
      const result = await turnOnDevice(
        TEST_DATA.deviceId,
        TEST_DATA.deviceIp,
        TEST_DATA.userEmail,
      );

      // Assert the transaction was called
      expect(db.$transaction).toHaveBeenCalledTimes(1);

      // Assert that usage.create was called with the correct parameters
      expect(db.usage.create).toHaveBeenCalledWith({
        data: {
          user_email: TEST_DATA.userEmail,
          device_id: TEST_DATA.deviceId,
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
          device_id: TEST_DATA.deviceId,
          usage_record_id: TEST_DATA.mockUsageId,
        },
        include: {
          usage: true,
          device: true,
        },
      });

      // Assert the returned result matches our expected structure
      expect(result).toEqual(
        expect.objectContaining({
          device_id: TEST_DATA.deviceId,
          usage_record_id: TEST_DATA.mockUsageId,
          usage: expect.objectContaining({
            id: TEST_DATA.mockUsageId,
            user_email: TEST_DATA.userEmail,
            device_id: TEST_DATA.deviceId,
          }),
          device: expect.objectContaining({
            id: TEST_DATA.deviceId,
            alias: "Test Device",
          }),
        }),
      );
    });

    it("should successfully turn on a device with estimated use time", async () => {
      // Setup estimated use time
      const estimatedUseTime = new Date(
        TEST_DATA.mockCurrentDate.getTime() + 3600000,
      ); // 1 hour later

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
        TEST_DATA.deviceId,
        TEST_DATA.deviceIp,
        TEST_DATA.userEmail,
        estimatedUseTime,
      );

      // Assert that usage.create was called with the correct parameters
      expect(db.usage.create).toHaveBeenCalledWith({
        data: {
          user_email: TEST_DATA.userEmail,
          device_id: TEST_DATA.deviceId,
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

    it("should use fetch API if the IP address is in the SPECIAL_DEVICE_IPS env var", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.usage.create.mockResolvedValueOnce(createMockUsageRecord() as any);
      mockDB.active_device.create.mockResolvedValueOnce({} as any);

      // Setup API environment and mock fetch
      setupApiEnvironment();
      mockFetchApi();

      // Call the function
      await turnOnDevice(
        TEST_DATA.deviceId,
        TEST_DATA.specialIp,
        TEST_DATA.userEmail,
      );

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_DATA.apiEndpoint}/on/${TEST_DATA.specialIp}`,
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
      const consoleErrorSpy = setupConsoleErrorSpy();

      // Call the function and expect it to throw
      await expect(
        turnOnDevice(
          TEST_DATA.deviceId,
          TEST_DATA.deviceIp,
          TEST_DATA.userEmail,
        ),
      ).rejects.toThrow(`Failed to turn on device: ${errorMessage}`);

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
      const consoleErrorSpy = setupConsoleErrorSpy();

      // Call the function and expect it to throw with a generic message
      await expect(
        turnOnDevice(
          TEST_DATA.deviceId,
          TEST_DATA.deviceIp,
          TEST_DATA.userEmail,
        ),
      ).rejects.toThrow("Failed to turn on device: Unknown error");

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
    it("should successfully turn off a device", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );
      mockDB.usage.update.mockResolvedValueOnce({
        ...createMockUsageRecord(),
        end_date: TEST_DATA.mockCurrentDate,
        consumption:
          TEST_DATA.mockFinalConsumption - TEST_DATA.mockInitialConsumption,
      } as any);
      mockDB.active_device.delete.mockResolvedValueOnce({} as any);

      jest.spyOn(utils, "simulateApiCall").mockResolvedValueOnce({
        usage: { today_energy: TEST_DATA.mockFinalConsumption },
      } as any);

      // Call the function under test
      const result = await turnOffDevice(
        TEST_DATA.deviceId,
        TEST_DATA.deviceIp,
      );

      // Assert the transaction was called
      expect(db.$transaction).toHaveBeenCalledTimes(1);

      // Assert that active_device.findFirst was called with correct parameters
      expect(db.active_device.findFirst).toHaveBeenCalledWith({
        where: { device_id: TEST_DATA.deviceId },
        include: {
          usage: true,
          device: true,
        },
      });

      // Assert that usage.update was called with correct parameters
      expect(db.usage.update).toHaveBeenCalledWith({
        where: { id: TEST_DATA.mockUsageId },
        data: {
          end_date: expect.any(Date),
          consumption:
            TEST_DATA.mockFinalConsumption - TEST_DATA.mockInitialConsumption,
        },
      });

      // Assert that active_device.delete was called with correct parameters
      expect(db.active_device.delete).toHaveBeenCalledWith({
        where: { device_id: TEST_DATA.deviceId },
      });

      // Assert the returned result matches our expected structure
      expect(result).toEqual(
        expect.objectContaining({
          device_id: TEST_DATA.deviceId,
          usage_record_id: TEST_DATA.mockUsageId,
          usage: expect.objectContaining({
            id: TEST_DATA.mockUsageId,
            end_date: expect.any(Date),
            consumption:
              TEST_DATA.mockFinalConsumption - TEST_DATA.mockInitialConsumption,
          }),
        }),
      );
    });

    it("should throw error when device is not active", async () => {
      // Setup mock to return null for inactive device
      mockDB.active_device.findFirst.mockResolvedValueOnce(null);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = setupConsoleErrorSpy();

      // Call the function and expect it to throw
      await expect(
        turnOffDevice(TEST_DATA.deviceId, TEST_DATA.deviceIp),
      ).rejects.toThrow(
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

    it("should use fetch API if the IP address is in the SPECIAL_DEVICE_IPS env var", async () => {
      // Setup mocks
      setupTransactionMock();
      mockDB.active_device.findFirst.mockResolvedValueOnce(
        createMockActiveDeviceRecord() as any,
      );
      mockDB.usage.update.mockResolvedValueOnce({
        ...createMockUsageRecord(),
        end_date: TEST_DATA.mockCurrentDate,
        consumption:
          TEST_DATA.mockFinalConsumption - TEST_DATA.mockInitialConsumption,
      } as any);
      mockDB.active_device.delete.mockResolvedValueOnce({} as any);

      // Setup API environment and mock fetch
      setupApiEnvironment();
      mockFetchApi();

      // Call the function
      await turnOffDevice(TEST_DATA.deviceId, TEST_DATA.specialIp);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_DATA.apiEndpoint}/off/${TEST_DATA.specialIp}`,
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
        usage: { today_energy: TEST_DATA.mockFinalConsumption },
      } as any);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = setupConsoleErrorSpy();

      // Call the function and expect it to throw
      await expect(
        turnOffDevice(TEST_DATA.deviceId, TEST_DATA.deviceIp),
      ).rejects.toThrow(`Failed to turn off device: ${errorMessage}`);

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
        usage: { today_energy: TEST_DATA.mockFinalConsumption },
      } as any);

      // Spy on console.error to keep the jest output clean
      const consoleErrorSpy = setupConsoleErrorSpy();

      // Call the function and expect it to throw with a generic message
      await expect(
        turnOffDevice(TEST_DATA.deviceId, TEST_DATA.deviceIp),
      ).rejects.toThrow("Failed to turn off device: Unknown error");

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

const mockDB = db as unknown as DeepMockProxy<PrismaClient>;

// Common test data and utilities
const TEST_DATA = {
  deviceId: "device-123",
  deviceIp: "192.168.0.143",
  userEmail: "user@example.com",
  mockUsageId: BigInt(123),
  mockCurrentDate: new Date(),
  mockInitialConsumption: 42,
  mockFinalConsumption: 100,
  specialIp: "192.168.0.190",
  apiEndpoint: "http://api.example.com",
};

// Helper function to create mock usage record
const createMockUsageRecord = (
  estimatedUseTime: Date | null = null,
  consumption: number = TEST_DATA.mockInitialConsumption,
) => ({
  id: TEST_DATA.mockUsageId,
  user_email: TEST_DATA.userEmail,
  device_id: TEST_DATA.deviceId,
  start_date: TEST_DATA.mockCurrentDate,
  end_date: TEST_DATA.mockCurrentDate,
  estimated_use_time: estimatedUseTime,
  consumption,
  charge: 0,
});

// Helper function to create mock active device record
const createMockActiveDeviceRecord = (
  estimatedUseTime: Date | null = null,
) => ({
  device_id: TEST_DATA.deviceId,
  usage_record_id: TEST_DATA.mockUsageId,
  usage: createMockUsageRecord(estimatedUseTime),
  device: {
    id: TEST_DATA.deviceId,
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

// Helper to setup API environment
const setupApiEnvironment = () => {
  process.env.URJ_FSFY_API = TEST_DATA.apiEndpoint;
  process.env.URJ_FSFY_API_USER = "testuser";
  process.env.URJ_FSFY_API_PWD = "testpass";
  process.env.SPECIAL_DEVICE_IPS = TEST_DATA.specialIp;
};

// Helper to mock fetch API
const mockFetchApi = (energyValue: number = TEST_DATA.mockFinalConsumption) => {
  return (global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
      usage: { today_energy: energyValue },
    }),
  } as any));
};

// Helper to create and setup console error spy
const setupConsoleErrorSpy = () => {
  return jest.spyOn(console, "error").mockImplementation();
};
