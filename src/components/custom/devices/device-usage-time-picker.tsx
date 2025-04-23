"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { turnOnDeviceAction } from "@/lib/actions/device-actions";
import { FreeDeviceSwitch } from "./free-device-switch";
import {
  getCurrentDatePlusOneMin,
  getCurrentDatePlusEightHours,
  getDateTimeLocalValue,
  isDateInFuture,
  isWithinEightHours,
  parseDateTimeLocalInput,
} from "@/lib/utils";

interface DeviceUsageTimePickerProps {
  deviceId: string;
  deviceIp: string;
}

export function DeviceUsageTimePicker({
  deviceId,
  deviceIp,
}: DeviceUsageTimePickerProps) {
  const [dateTimeInputValue, setDateTimeInputValue] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Validate the selected date and return an error message if invalid
  const validateDateTime = (dateTimeStr: string): string | null => {
    const selectedDate = parseDateTimeLocalInput(dateTimeStr);

    // Validate if date is in the future
    if (!isDateInFuture(selectedDate)) {
      return "Time must be in the future";
    }

    // Validate if date is within 8 hours
    if (!isWithinEightHours(selectedDate)) {
      return "A device cannot be blocked for more than 8 hours";
    }

    return null;
  };

  const handleDeviceAction = async (estimatedUseTime?: Date) => {
    try {
      const result = await turnOnDeviceAction(
        deviceId,
        deviceIp,
        estimatedUseTime,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsDialogOpen(false);
      // Keep the switch in ON state after successful action
    } catch (error) {
      console.error(
        `Error turning on device${estimatedUseTime ? " with estimated time" : " directly"}:`,
        error,
      );
      // If there's an error, reset the switch
      setIsSwitchOn(false);
    }
  };

  const handleCheckedChange = async (isOn: boolean) => {
    /* istanbul ignore else */
    if (isOn) {
      // When switch is toggled ON, open the dialog for estimated time
      setIsSwitchOn(true);
      setIsDialogOpen(true);
      // Update the time to current time + 1 minute whenever dialog opens
      setDateTimeInputValue(getDateTimeLocalValue(getCurrentDatePlusOneMin()));
      setTimeError(null);
    } else {
      //since the user never manually turns off the switch within the active device list this part is never reached
      setIsSwitchOn(false);
    }
  };

  const handleDialogOpenChange = () => {
    // When dialog is closed without action, reset the switch
    setIsDialogOpen(false);
    setIsSwitchOn(false);
    setTimeError(null);
  };

  const handleTimeChange = (value: string) => {
    setDateTimeInputValue(value);
    setTimeError(validateDateTime(value));
  };

  const handleTurnOn = async () => {
    // istanbul ignore if
    if (isPending || timeError) return;

    // Validate time again before proceeding
    const error = validateDateTime(dateTimeInputValue);
    if (error) {
      setTimeError(error);
      return;
    }

    startTransition(async () => {
      const selectedDate = new Date(dateTimeInputValue);
      await handleDeviceAction(selectedDate);
    });
  };

  // Handle direct turn on (without estimated time)
  const handleDirectTurnOn = async () => {
    //istanbul ignore next -- button is disabled when loading so this part is never reached but we keep it to be safe
    if (isPending) return;

    startTransition(async () => {
      await handleDeviceAction();
    });
  };

  return (
    <div className="flex items-center">
      <FreeDeviceSwitch
        deviceId={deviceId}
        onCheckedChange={handleCheckedChange}
        disabled={isDialogOpen && isPending}
        checked={isSwitchOn}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Turn On Device</DialogTitle>
            <DialogDescription>
              Set the estimated time you&apos;ll be using this device.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4">
            <div className="space-y-2">
              <Label htmlFor={`est-time-${deviceId}`}>
                Estimated use until
              </Label>
              <Input
                id={`est-time-${deviceId}`}
                type="datetime-local"
                value={dateTimeInputValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                min={getDateTimeLocalValue(getCurrentDatePlusOneMin())}
                max={getDateTimeLocalValue(getCurrentDatePlusEightHours())}
                className={timeError ? "border-red-500" : ""}
              />
              <p className="h-4 text-sm text-red-500">{timeError}</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleDirectTurnOn}
              disabled={isPending}
              className="mb-2 flex-1 sm:mb-0"
            >
              {isPending ? "Turning On..." : "Turn On Without Timer"}
            </Button>
            <Button
              onClick={handleTurnOn}
              disabled={isPending || !!timeError}
              className="flex-1"
            >
              {isPending ? "Turning On..." : "Turn On With Timer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
