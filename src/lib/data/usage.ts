import { db } from "@/lib/db";

export async function getRecentUsage(limit = 10) {
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

export async function getUserUsage(userEmail: string) {
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

export async function getTotalConsumption() {
  const result = await db.usage.aggregate({
    _sum: {
      consumption: true,
    },
  });

  return result._sum.consumption || 0;
}

export async function getActiveUsages() {
  return db.active_device.findMany({
    include: {
      device: true,
      usage: true,
    },
  });
}
