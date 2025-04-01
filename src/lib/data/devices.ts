import { db } from "@/lib/db";
import type { device, usage } from "@prisma/client";

export async function getAllDevices() {
  return db.device.findMany({
    where: {
      is_archived: false,
    },
    orderBy: {
      alias: "asc",
    },
  });
}

export async function getDeviceById(id: string) {
  return db.device.findUnique({
    where: { id },
  });
}

export async function getDeviceUsage(deviceId: string) {
  return db.usage.findMany({
    where: {
      device_id: deviceId,
    },
    orderBy: {
      start_date: "desc",
    },
  });
}

export async function getActiveDevice(deviceId: string) {
  return db.active_device.findUnique({
    where: {
      device_id: deviceId,
    },
    include: {
      usage: true,
    },
  });
}

export type DeviceWithActiveStatus = device & {
  isActive: boolean;
};

export async function getDevicesWithActiveStatus(): Promise<
  DeviceWithActiveStatus[]
> {
  const devices = await db.device.findMany({
    where: {
      is_archived: false,
    },
    include: {
      active_device: true,
    },
    orderBy: {
      alias: "asc",
    },
  });

  return devices.map((device) => ({
    ...device,
    isActive: device.active_device !== null,
  }));
}

type BusyDevice = device & {
  usage: usage;
};

type FreeDevice = device;

export type DevicesWithStatus = {
  freeDevices: FreeDevice[];
  busyDevices: BusyDevice[];
};

export async function getDevicesWithStatus(): Promise<DevicesWithStatus> {
  const devices = await db.device.findMany({
    where: {
      is_archived: false,
    },
    include: {
      active_device: {
        include: {
          usage: true,
        },
      },
    },
    orderBy: {
      alias: "asc",
    },
  });

  const freeDevices: FreeDevice[] = [];
  const busyDevices: BusyDevice[] = [];

  devices.forEach((device) => {
    if (device.active_device) {
      busyDevices.push({
        ...device,
        usage: device.active_device.usage,
      });
    } else {
      freeDevices.push(device);
    }
  });

  return {
    freeDevices,
    busyDevices,
  };
}

/**
 * Turns on a device by creating a usage record and active device entry
 * @param deviceId The ID of the device to turn on
 * @param userEmail The email of the user turning on the device
 * @param estimatedUseTime Optional estimated time when the user will finish using the device
 * @returns The created active device entry with usage information
 */
export async function turnOnDevice(
  deviceId: string,
  userEmail: string,
  estimatedUseTime?: Date,
) {
  try {
    // 1. Call the simulate API to get dummy data
    const { simulateApiCall } = await import("@/lib/utils");
    const currentDate = new Date().toISOString();
    const apiResponse = await simulateApiCall(
      deviceId,
      true,
      null,
      currentDate,
    );

    // 2. Create a transaction to ensure both operations succeed or fail together
    return await db.$transaction(async (tx) => {
      // 3. Create a usage record with the dummy data
      const usageRecord = await tx.usage.create({
        data: {
          user_email: userEmail,
          device_id: deviceId,
          start_date: new Date(),
          end_date: new Date(), // Same as start_date when device is turned on
          estimated_use_time: estimatedUseTime,
          consumption: apiResponse.usage.today_energy, // Initial consumption is 0
          charge: 0, // Initial charge is 0
        },
      });

      // 4. Create an active device entry linked to the usage record
      const activeDevice = await tx.active_device.create({
        data: {
          device_id: deviceId,
          usage_record_id: usageRecord.id,
        },
        include: {
          usage: true,
          device: true,
        },
      });

      return activeDevice;
    });
  } catch (error) {
    console.error("Error turning on device:", error);
    throw new Error(
      `Failed to turn on device: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
