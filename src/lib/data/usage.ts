import { db } from "@/lib/db";

/* istanbul ignore next */
async function getRecentUsage(limit = 10) {
  return db.usage.findMany({
    take: limit,
    orderBy: {
      start_date: "desc",
    },
    include: {
      device: true,
    },
  });
}

/* istanbul ignore next */
async function getUserUsage(userEmail: string) {
  return db.usage.findMany({
    where: {
      user_email: userEmail,
    },
    orderBy: {
      start_date: "desc",
    },
    include: {
      device: true,
    },
  });
}

/* istanbul ignore next */
async function getTotalConsumption() {
  const result = await db.usage.aggregate({
    _sum: {
      consumption: true,
    },
  });

  return result._sum.consumption || 0;
}

/* istanbul ignore next */
async function getActiveUsages() {
  return db.active_device.findMany({
    include: {
      device: true,
      usage: true,
    },
  });
}

/**
 * Update the estimated use time for a usage record
 * @param usageId The ID of the usage record to update
 * @param newTime The new estimated use time
 * @returns The updated usage record
 */
export async function updateEstimatedTime(usageId: bigint, newTime: Date) {
  return db.usage.update({
    where: { id: usageId },
    data: { estimated_use_time: newTime },
  });
}

//using this sytax for making istanbul ignore next work.
export { getRecentUsage, getUserUsage, getTotalConsumption, getActiveUsages };
