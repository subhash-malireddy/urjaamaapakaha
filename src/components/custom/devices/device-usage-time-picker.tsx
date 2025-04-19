"use client";

import { useState } from "react";
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
} from "@/lib/utils";

interface DeviceUsageTimePickerProps {
  deviceId: string;
  deviceIp: string;
}

export function DeviceUsageTimePicker({
  deviceId,
  deviceIp,
}: DeviceUsageTimePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedDateTime, setEstimatedDateTime] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Validate the selected date and return an error message if invalid
  const validateDateTime = (dateTimeStr: string): string | null => {
    const selectedDate = new Date(dateTimeStr);

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

  const handleCheckedChange = async (isOn: boolean) => {
    /* istanbul ignore else */
    if (isOn) {
      // When switch is toggled ON, open the dialog for estimated time
      setIsSwitchOn(true);
      setIsDialogOpen(true);
      // Update the time to current time + 1 minute whenever dialog opens
      setEstimatedDateTime(getDateTimeLocalValue(getCurrentDatePlusOneMin()));
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
    setEstimatedDateTime(value);
    setTimeError(validateDateTime(value));
  };

  const handleTurnOn = async () => {
    // istanbul ignore if
    if (isLoading || timeError) return;

    // Validate time again before proceeding
    const error = validateDateTime(estimatedDateTime);
    if (error) {
      setTimeError(error);
      return;
    }

    try {
      setIsLoading(true);
      const selectedDate = new Date(estimatedDateTime);

      const result = await turnOnDeviceAction(deviceId, deviceIp, selectedDate);

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsDialogOpen(false);
      // Keep the switch in ON state after successful action
    } catch (error) {
      console.error("Error turning on device with estimated time:", error);
      // If there's an error, reset the switch
      setIsSwitchOn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle direct turn on (without estimated time)
  const handleDirectTurnOn = async () => {
    //istanbul ignore next -- button is disabled when loading so this part is never reached but we keep it to be safe
    if (isLoading) return;

    try {
      setIsLoading(true);

      const result = await turnOnDeviceAction(deviceId, deviceIp);

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsDialogOpen(false);
      // Keep the switch in ON state after successful action
    } catch (error) {
      console.error("Error turning on device directly:", error);
      // If there's an error, reset the switch
      setIsSwitchOn(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <FreeDeviceSwitch
        deviceId={deviceId}
        onCheckedChange={handleCheckedChange}
        disabled={isDialogOpen && isLoading}
        checked={isSwitchOn}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Turn On Device</DialogTitle>
            <DialogDescription>
              Set the estimated time you&apos;ll be using this device.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor={`est-time-${deviceId}`}>
                Estimated use until
              </Label>
              <Input
                id={`est-time-${deviceId}`}
                type="datetime-local"
                value={estimatedDateTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                min={getDateTimeLocalValue(getCurrentDatePlusOneMin())}
                max={getDateTimeLocalValue(getCurrentDatePlusEightHours())}
                className={timeError ? "border-red-500" : ""}
              />
              {timeError && <p className="text-sm text-red-500">{timeError}</p>}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleDirectTurnOn}
              disabled={isLoading}
              className="mb-2 sm:mb-0"
            >
              {isLoading ? "Turning On..." : "Turn On Without Timer"}
            </Button>
            <Button onClick={handleTurnOn} disabled={isLoading || !!timeError}>
              {isLoading ? "Turning On..." : "Turn On With Timer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
