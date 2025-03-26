import { db } from "@/lib/db";
import type { active_device, device } from "@prisma/client";

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
  active_device: active_device;
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
        active_device: device.active_device,
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
