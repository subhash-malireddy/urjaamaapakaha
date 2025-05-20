import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

type GroupBy = "day" | "week" | "month";

interface UsageData {
  period: Date;
  deviceId: string;
  consumption: Prisma.Decimal;
  userEmail: string;
}

/**
 * @description Aggregates usage records by day, calculating total consumption between the specified start and end dates. When a deviceId is provided, returns data for that specific device; otherwise, includes consumption data for all devices.
 */
export async function getUsageData({
  deviceId,
  startDate,
  endDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  groupBy = "day", // TODO:: DO we need this arg?
}: {
  deviceId?: string;
  startDate: Date;
  endDate: Date;
  groupBy?: GroupBy;
}): Promise<UsageData[]> {
  // For now, we'll need to use raw SQL as Prisma's groupBy doesn't support
  // date truncation and complex grouping operations
  // Date_Trunc might not be the one we need, becasue given a start date at the beginning of the month,
  // the grouping might happen from a date in the previous month especially if the beginning date is in a week that started in the previous month
  // so we need to use the start date to determine the grouping
  // TODO:: do we need device_id???
  //TODO:: Should this be endDate or do we need to use only startDate?
  const result = await db.$queryRaw<UsageData[]>`
    SELECT 
      DATE_TRUNC('day', start_date) as period,
      device_id as "deviceId",
      SUM(consumption) as consumption,
      user_email as "userEmail"
    FROM 
      usage
    WHERE 
      start_date >= ${startDate}
      AND end_date <= ${endDate}
      ${deviceId ? Prisma.sql`AND device_id = ${deviceId}` : Prisma.sql``}
    GROUP BY 
      period, device_id, user_email
    ORDER BY 
      period, user_email, device_id
  `;
  console.log("📜result:: ", result[0].consumption instanceof Prisma.Decimal);
  return result;
}

//using this sytax for making istanbul ignore next work.
export { getRecentUsage, getUserUsage, getTotalConsumption, getActiveUsages };
