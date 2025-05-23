"use server";

import { auth } from "@/auth";
import { getActiveDevice } from "../data/devices";
import { updateEstimatedTime } from "../data/usage";
import {
  areDatesEqualToMinute,
  convertDateTimeLocalToUTC,
  isDateInFuture,
  isWithinEightHoursFromDate,
} from "../utils";

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
    const deviceId = formData.get("deviceId");
    const estDateTimeLocalStr = formData.get("estimatedDateTimeLocal");
    const clientTzOffset = formData.get("timezoneOffset");

    const areRequiredFieldsValid =
      typeof deviceId === "string" &&
      typeof estDateTimeLocalStr === "string" &&
      typeof clientTzOffset === "string";

    if (!areRequiredFieldsValid) {
      return {
        message: "Invalid form data",
        error: "Validation Error",
      };
    }

    // Get current user session
    const session = await auth();
    const userEmail = session?.user?.email;
    const role = session?.user?.role;
    const isMember = role === "member";
    const canInteractWithDevice = !!userEmail && isMember;

    if (!canInteractWithDevice) {
      return { message: "Unauthorized", error: "Unauthorized" };
    }

    const estimatedDate = convertDateTimeLocalToUTC(
      estDateTimeLocalStr,
      clientTzOffset,
    );

    if (isNaN(estimatedDate.getTime())) {
      return {
        message: "Invalid date format",
        error: "Validation Error",
      };
    }

    if (!isDateInFuture(estimatedDate)) {
      return {
        message: "Date must be in the future",
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
            start_date: true,
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
      if (areDatesEqualToMinute(currentTime, estimatedDate)) {
        return {
          message: "No change made to the date",
          error: "Validation Error",
        };
      }
    }

    // Validate if date is within 8 hours of the original start date
    if (
      !isWithinEightHoursFromDate(estimatedDate, activeDevice.usage.start_date)
    ) {
      return {
        message: "Date must be within 8 hours of the start date",
        error: "Validation Error",
      };
    }

    // Update the usage record with the new estimated Date
    await updateEstimatedTime(activeDevice.usage.id, estimatedDate);

    return {
      message: "Date updated successfully",
      updatedTime: estimatedDate,
    };
  } catch (error) {
    console.error("Failed to update date:", error);
    if (error instanceof Error) {
      return {
        message: error.message,
        error: "Server Error",
      };
    }
    return {
      message: "Error updating date",
      error: "Server Error",
    };
  }
}
