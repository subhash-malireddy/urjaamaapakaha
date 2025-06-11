import { db } from "@/lib/db";
import { roundUpTwoDecimals } from "@/lib/utils";
import type { device, usage } from "@prisma/client";
import {
  deviceOffResponseSchema,
  type DeviceOffResponse,
  type DeviceOnResponse,
  deviceOnResponseSchema,
} from "../zod/device";
import { deviceSelectListResponseSchema } from "../zod/usage";

export async function getAllDevicesOnlyIdAndAlias() {
  const devices = await db.device.findMany({
    where: {
      is_archived: false,
    },
    orderBy: {
      alias: "asc",
    },
    select: {
      id: true,
      alias: true,
    },
  });

  return deviceSelectListResponseSchema.parse(devices);
}

/* istanbul ignore next */
async function getDeviceById(id: string) {
  return db.device.findUnique({
    where: { id },
  });
}
/* istanbul ignore next */
async function getDeviceUsage(deviceId: string) {
  return db.usage.findMany({
    where: {
      device_id: deviceId,
    },
    orderBy: {
      start_date: "desc",
    },
  });
}

type ActiveDeviceFindUniqueArgs = Parameters<
  typeof db.active_device.findUnique
>[0];

type GetActiveDeviceReturnType<T extends ActiveDeviceFindUniqueArgs> =
  ReturnType<typeof db.active_device.findUnique<T>>;

/**
 * Get an active device by its ID
 * @param options The options for the findUnique query
 * @returns The active device based on the requested shape in the options
 */
export async function getActiveDevice<T extends ActiveDeviceFindUniqueArgs>(
  options: T,
): Promise<GetActiveDeviceReturnType<T>> {
  return db.active_device.findUnique(options) as GetActiveDeviceReturnType<T>;
}

export type DeviceWithActiveStatus = device & {
  isActive: boolean;
};

/* istanbul ignore next */
async function getDevicesWithActiveStatus(): Promise<DeviceWithActiveStatus[]> {
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

//TODO:: Add tests for this function
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
 * @param deviceIp The IP address of the device to turn on
 * @param userEmail The email of the user turning on the device
 * @param estimatedUseTime Optional estimated time when the user will finish using the device
 * @returns The created active device entry with usage information
 */
export async function turnOnDevice(
  deviceId: string,
  deviceIp: string,
  userEmail: string,
  estimatedUseTime?: Date,
) {
  try {
    let apiResponse: DeviceOnResponse;
    const shouldCallRealApi =
      process.env.SHOULD_CALL_REAL_API === "1" ||
      process.env.SPECIAL_DEVICE_IPS?.split(",").includes(deviceIp);
    if (shouldCallRealApi) {
      const credentials = Buffer.from(
        `${process.env.URJ_FSFY_API_USER}:${process.env.URJ_FSFY_API_PWD}`,
      ).toString("base64");
      const rawApiResponse = await (
        await fetch(`${process.env.URJ_FSFY_API}/on/${deviceIp}`, {
          cache: "no-cache",
          headers: {
            "x-forwarded-authybasic": `Basic ${credentials}`,
          },
        })
      ).json();
      apiResponse = deviceOnResponseSchema.parse(rawApiResponse);
    } else {
      // 1. Call the simulate API to get dummy data
      const { simulateApiCall } = await import("@/lib/utils");
      const currentDate = new Date().toISOString();
      const simulatedUsage = await simulateApiCall(
        deviceIp,
        true,
        null,
        currentDate,
      );

      apiResponse = { status: 1, ...simulatedUsage };
    }

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
          consumption: apiResponse.usage.month_energy, // Initial consumption is 0
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

/**
 *
 * @param deviceId The ID of the device to turn off
 * @param deviceIp The IP address of the device to turn off
 * @returns The updated in-active device entry with usage information
 */
export async function turnOffDevice(deviceId: string, deviceIp: string) {
  try {
    // Get active device and its usage record
    const activeDevice = await db.active_device.findFirst({
      where: { device_id: deviceId },
      include: {
        usage: true,
        device: true,
      },
    });

    if (!activeDevice || !activeDevice.usage) {
      throw new Error("Device is not currently active or missing usage record");
    }

    let apiResponse: DeviceOffResponse;

    const shouldCallRealApi =
      process.env.SHOULD_CALL_REAL_API === "1" ||
      process.env.SPECIAL_DEVICE_IPS?.split(",").includes(deviceIp);

    if (shouldCallRealApi) {
      // call real api
      const credentials = Buffer.from(
        `${process.env.URJ_FSFY_API_USER}:${process.env.URJ_FSFY_API_PWD}`,
      ).toString("base64");
      const rawApiResponse = await (
        await fetch(`${process.env.URJ_FSFY_API}/off/${deviceIp}`, {
          cache: "no-cache",
          headers: {
            "x-forwarded-authybasic": `Basic ${credentials}`,
          },
        })
      ).json();
      apiResponse = deviceOffResponseSchema.parse(rawApiResponse);
    } else {
      // Call the simulate API to get dummy data
      const { simulateApiCall } = await import("@/lib/utils");
      const simulatedUsage = await simulateApiCall(
        deviceIp,
        false,
        activeDevice.usage.start_date.toISOString(),
        new Date().toISOString(),
      );
      apiResponse = { status: 0, ...simulatedUsage };
    }

    // Calculate final consumption and update records in a transaction
    return await db.$transaction(async (tx) => {
      // Calculate final consumption (current - initial)
      const finalConsumption = shouldCallRealApi
        ? roundUpTwoDecimals(
            Number(apiResponse.usage.month_energy) -
              Number(activeDevice.usage.consumption),
          )
        : Number(
            (
              Math.ceil(
                Math.abs(
                  // Math.abs is used to ensure the result is positive
                  Number(apiResponse.usage.month_energy) -
                    Number(activeDevice.usage.consumption),
                ) * 100,
              ) / 100
            ).toFixed(2),
          );

      // Update usage record with end time and final consumption
      const updatedUsage = await tx.usage.update({
        where: { id: activeDevice.usage.id },
        data: {
          end_date: new Date(),
          consumption: finalConsumption,
        },
      });

      // Remove active device entry
      await tx.active_device.delete({
        where: { device_id: deviceId },
      });

      return {
        ...activeDevice,
        usage: updatedUsage,
      };
    });
  } catch (error) {
    console.error("Error turning off device:", error);
    throw new Error(
      `Failed to turn off device: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

//using this sytax for making istanbul ignore next work.
export { getDeviceById, getDeviceUsage, getDevicesWithActiveStatus };
