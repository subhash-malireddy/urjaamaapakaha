import { db } from "@/lib/db";
import type { device } from "@prisma/client";

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

type ActiveDevices = device & {
  isActive: true;
  usage_record_id: string;
};

export type DevicesWithStatus = {
  activeDevices: ActiveDevices[];
  inactiveDevices: device[];
};

export async function getDevicesWithStatus(): Promise<DevicesWithStatus> {
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

  const activeDevices: ActiveDevices[] = [];
  const inactiveDevices: device[] = [];

  devices.forEach((device) => {
    if (device.active_device) {
      activeDevices.push({
        ...device,
        isActive: true,
        usage_record_id: device.active_device.usage_record_id.toString(),
      });
    } else {
      inactiveDevices.push(device);
    }
  });

  return {
    activeDevices,
    inactiveDevices,
  };
}
