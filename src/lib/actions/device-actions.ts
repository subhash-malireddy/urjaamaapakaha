"use server";

import { auth } from "@/app/auth";
import { turnOnDevice } from "../data/devices";
import { serialize } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/**
 * Server action to turn on a device
 * @param deviceId The ID of the device to turn on
 * @returns Object containing success status and message or error
 */
export async function turnOnDeviceAction(deviceId: string) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!deviceId) {
      return { success: false, error: "Device ID is required" };
    }

    // Turn on the device
    const result = await turnOnDevice(deviceId, session.user.email);
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
