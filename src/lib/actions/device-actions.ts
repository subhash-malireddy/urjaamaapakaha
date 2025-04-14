"use server";

import { auth } from "@/auth";
import { getActiveDevice, turnOnDevice, turnOffDevice } from "../data/devices";
import { serialize } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { updateEstimatedTime } from "../data/usage";

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

// Define the state type
interface EstimatedTimeState {
  message: string;
  error?: string;
  updatedTime?: Date | null;
}

/**
 * Update the estimated usage time for a device
 */
export async function updateEstimatedTimeAction(
  _prevState: EstimatedTimeState,
  formData: FormData,
): Promise<EstimatedTimeState> {
  try {
    const deviceId = formData.get("deviceId") as string;
    const newTimeStr = formData.get("estimatedTime") as string;

    // Get current user session
    const session = await auth();
    if (!session?.user?.email) {
      return { message: "You must be logged in", error: "Unauthorized" };
    }

    // Basic validation
    if (!newTimeStr || !deviceId) {
      return { message: "Missing required fields", error: "Validation Error" };
    }

    const newTime = new Date(newTimeStr);
    if (isNaN(newTime.getTime()) || newTime <= new Date()) {
      return {
        message: "Time must be in the future",
        error: "Validation Error",
      };
    }

    // Get current active device record
    const activeDevice = await getActiveDevice({
      where: {
        device_id: deviceId,
      },
      include: {
        usage: {
          select: {
            id: true,
            user_email: true,
            estimated_use_time: true,
          },
        },
      },
    });

    if (!activeDevice) {
      return { message: "Device is not currently in use", error: "Not Found" };
    }

    // Verify the current user is the one using the device
    if (activeDevice.usage.user_email !== session.user.email) {
      return {
        message: "You can only update times for your own devices",
        error: "Forbidden",
      };
    }

    // Check if the new time is the same as the current time
    if (activeDevice.usage.estimated_use_time) {
      const currentTime = new Date(activeDevice.usage.estimated_use_time);
      const isSameTime = currentTime.getTime() === newTime.getTime();

      if (isSameTime) {
        return {
          message: "No change made to the time",
          error: "Validation Error",
        };
      }
    }

    // Update the usage record with the new estimated time
    await updateEstimatedTime(activeDevice.usage.id, newTime);

    // Revalidate the path to reflect changes
    revalidatePath("/");

    return {
      message: "Time updated successfully",
      updatedTime: newTime,
    };
  } catch (error) {
    console.error("Failed to update time:", error);
    return {
      message: "Server error updating time",
      error: "Server Error",
    };
  }
}
