"use server";

import { auth } from "@/auth";
import { getActiveDevice } from "../data/devices";
import { updateEstimatedTime, getUsageData } from "../data/usage";
import {
  areDatesEqualToMinute,
  convertDateTimeLocalToUTC,
  isDateInFuture,
  isWithinEightHoursFromDate,
} from "../utils";
import {
  getDateRangeForTimePeriod,
  TimePeriod,
  groupByWeek,
  groupByMonth,
} from "../usage-utils";

// Define the state type
interface EstimatedTimeState {
  message: string;
  error?: string;
  updatedTime?: Date | null;
}

interface UsageDataResponse {
  message: string;
  error?: string;
  data?: {
    userConsumption: {
      date: Date;
      consumption: number;
    }[];
    totalConsumption: {
      date: Date;
      consumption: number;
    }[];
  };
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

/**
 * Get the usage data for a given time period and deviceId
 * @param timePeriod - The time period to get the usage data for (e.g. "current week", "current month", "current year")
 * @param dateRange - The date range to get the usage data for. It must come from the client to account for timezone differences
 * @param deviceId - The deviceId to get the usage data for
 * @returns The usage data for the given time period and deviceId
 */
export async function getUsageDataAction(
  timePeriod: TimePeriod,
  dateRange: Omit<ReturnType<typeof getDateRangeForTimePeriod>, "formatted">,
  deviceId?: string,
): Promise<UsageDataResponse> {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return {
        message: "Unauthorized",
        error: "Unauthorized",
      };
    }

    const usageData = await getUsageData({
      deviceId,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    // Convert Prisma.Decimal to number
    const processedData = usageData.map((data) => ({
      ...data,
      consumption: data.consumption.toNumber(),
    }));

    // Group data based on time period
    const groupedData =
      timePeriod === "current month"
        ? groupByMonth(processedData, dateRange.start)
        : timePeriod === "current week"
          ? groupByWeek(processedData, dateRange.start)
          : processedData;

    // Separate user consumption and total consumption
    const userConsumption = groupedData
      .filter((data) => data.userEmail === userEmail)
      .map(({ period, consumption }) => ({
        date: period,
        consumption,
      }));

    const totalConsumption = groupedData.reduce(
      (acc, { period, consumption }) => {
        const key = period.toISOString();
        if (!acc[key]) {
          acc[key] = { date: period, consumption: 0 };
        }
        acc[key].consumption += consumption;
        return acc;
      },
      {} as Record<string, { date: Date; consumption: number }>,
    );

    return {
      message: "Usage data fetched successfully",
      data: {
        userConsumption,
        totalConsumption: Object.values(totalConsumption),
      },
    };
  } catch (error) {
    console.error("Failed to fetch usage data:", error);
    return {
      message: "Failed to fetch usage data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
