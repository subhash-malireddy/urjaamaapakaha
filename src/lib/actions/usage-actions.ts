"use server";

import { auth } from "@/auth";
import { getActiveDevice } from "../data/devices";
import { updateEstimatedTime } from "../data/usage";
import { areDatesEqualToMinute, isDateInFuture } from "../utils";

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
    if (isNaN(newTime.getTime()) || !isDateInFuture(newTime)) {
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
      if (areDatesEqualToMinute(currentTime, newTime)) {
        return {
          message: "No change made to the time",
          error: "Validation Error",
        };
      }
    }

    // Update the usage record with the new estimated time
    await updateEstimatedTime(activeDevice.usage.id, newTime);

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
