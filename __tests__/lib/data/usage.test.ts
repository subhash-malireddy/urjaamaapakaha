import { db } from "@/lib/db";
import { updateEstimatedTime } from "@/lib/data/usage";
import { PrismaClient } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended";

const mockDB = db as unknown as DeepMockProxy<PrismaClient>;

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
});
