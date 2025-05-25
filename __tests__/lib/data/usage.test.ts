import { db } from "@/lib/db";
import { updateEstimatedTime, getUsageData } from "@/lib/data/usage";
import { PrismaClient, Prisma } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

const mockDB = db as unknown as DeepMockProxy<PrismaClient>;

// Mock Prisma.sql
jest.mock("@prisma/client", () => {
  const actual = jest.requireActual("@prisma/client");
  return {
    ...actual,
    Prisma: {
      ...actual.Prisma,
      sql: jest.fn((strings: TemplateStringsArray, ...values: any[]) => {
        return {
          sql: strings.join(""),
          values,
        };
      }),
    },
  };
});

describe("Usage data functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateEstimatedTime", () => {
    const mockUsageId = BigInt(123);
    const mockNewTime = new Date("2024-03-20T10:00:00Z");

    it("should successfully update estimated time", async () => {
      const mockUpdatedUsage = {
        id: mockUsageId,
        estimated_use_time: mockNewTime,
        user_email: "test@example.com",
        device_id: "device-123",
        start_date: new Date(),
        end_date: null,
        consumption: 0,
        charge: 0,
      };

      mockDB.usage.update.mockResolvedValueOnce(mockUpdatedUsage as any);

      const result = await updateEstimatedTime(mockUsageId, mockNewTime);

      expect(db.usage.update).toHaveBeenCalledWith({
        where: { id: mockUsageId },
        data: { estimated_use_time: mockNewTime },
      });
      expect(result).toEqual(mockUpdatedUsage);
    });

    // it("should handle non-existent usage record", async () => {
    //   const error = new Error("Record to update not found.");
    //   mockDB.usage.update.mockRejectedValueOnce(error);

    //   await expect(
    //     updateEstimatedTime(mockUsageId, mockNewTime),
    //   ).rejects.toThrow("Record to update not found.");
    // });

    it("should throw database errors", async () => {
      const error = new Error("Some DB error");
      mockDB.usage.update.mockRejectedValueOnce(error);

      await expect(
        updateEstimatedTime(mockUsageId, mockNewTime),
      ).rejects.toThrow("Some DB error");
    });
  });

  describe("getUsageData function", () => {
    const mockUsageData = [
      {
        period: new Date("2024-03-20T00:00:00Z"),
        consumption: 10,
        userEmail: "test@example.com",
      },
      {
        period: new Date("2024-03-21T00:00:00Z"),
        consumption: 20,
        userEmail: "test@example.com",
      },
    ];

    it("should return correct usage data when filtering by device ID", async () => {
      // Mock the db.$queryRaw method to return a predefined set of usage data
      mockDB.$queryRaw.mockResolvedValueOnce(mockUsageData);

      // Call the getUsageData function with a specific device ID
      const deviceId = "device-123";
      const startDate = new Date("2024-03-19T00:00:00Z");
      const endDate = new Date("2024-03-22T00:00:00Z");

      const result = await getUsageData({ deviceId, startDate, endDate });

      // Verify the SQL query construction
      expect(Prisma.sql).toHaveBeenCalledWith(
        ["AND device_id = ", ""],
        deviceId,
      );

      // Verify the result matches the expected mock data
      expect(result).toEqual(mockUsageData);
    });

    it("should return correct usage data without device ID filter", async () => {
      mockDB.$queryRaw.mockResolvedValueOnce(mockUsageData);

      const startDate = new Date("2024-03-19T00:00:00Z");
      const endDate = new Date("2024-03-22T00:00:00Z");

      const result = await getUsageData({ startDate, endDate });

      // Verify empty SQL was used when no deviceId
      expect(Prisma.sql).toHaveBeenCalledWith([""]);

      expect(result).toEqual(mockUsageData);
    });
  });
});
