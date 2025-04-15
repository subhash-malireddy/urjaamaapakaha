"use server";

import { auth } from "@/auth";
import { turnOnDevice, turnOffDevice } from "../data/devices";
import { serialize } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/**
 * Server action to turn on a device
 * @param deviceId The ID of the device to turn on
 * @param estimatedUseTime Optional estimated time when the user will finish using the device
 * @returns Object containing success status and message or error
 */
export async function turnOnDeviceAction(
  deviceId: string,
  deviceIp: string,
  estimatedUseTime?: Date,
) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!deviceId) {
      return { success: false, error: "Device ID is required" };
    }

    if (!deviceIp) {
      return { success: false, error: "Device ip is required" };
    }

    // Turn on the device
    const result = await turnOnDevice(
      deviceId,
      deviceIp,
      session.user.email,
      estimatedUseTime,
    );
    revalidatePath("/");
    // Serialize the result to handle Decimal objects
    return { success: true, data: serialize(result) };
  } catch (error) {
    console.error("Error turning on device:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to turn on device",
    };
  }
}

export async function turnOffDeviceAction(deviceId: string, deviceIp: string) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!deviceId) {
      return { success: false, error: "Device ID is required" };
    }

    if (!deviceIp) {
      return { success: false, error: "Device ip is required" };
    }

    // Turn off the device
    const result = await turnOffDevice(deviceId, deviceIp);
    revalidatePath("/");
    return { success: true, data: serialize(result) };
  } catch (error) {
    console.error("Error turning off device:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to turn off device",
    };
  }
}
