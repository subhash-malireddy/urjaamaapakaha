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
import { getCurrentTimePlusOneMin, isTimeInFuture } from "@/lib/utils";

interface DeviceUsageTimePickerProps {
  deviceId: string;
  deviceIp: string;
}

export function DeviceUsageTimePicker({
  deviceId,
  deviceIp,
}: DeviceUsageTimePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>("00:00");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const handleCheckedChange = async (isOn: boolean) => {
    /* istanbul ignore else */
    if (isOn) {
      // When switch is toggled ON, open the dialog for estimated time
      setIsSwitchOn(true);
      setIsDialogOpen(true);
      // Update the time to current time + 1 minute whenever dialog opens
      setEstimatedTime(getCurrentTimePlusOneMin());
      setTimeError(false);
    } else {
      //since the user never manually turns off the switch this part is never reached
      setIsSwitchOn(false);
    }
  };

  const handleDialogOpenChange = () => {
    // When dialog is closed without action, reset the switch
    setIsDialogOpen(false);
    setIsSwitchOn(false);
    setTimeError(false);
  };

  const handleTimeChange = (value: string) => {
    setEstimatedTime(value);
    setTimeError(!isTimeInFuture(value));
  };

  const handleTurnOn = async () => {
    // istanbul ignore if
    if (isLoading || timeError) return;

    // Validate time is in the future
    if (!isTimeInFuture(estimatedTime)) {
      setTimeError(true);
      return;
    }

    try {
      setIsLoading(true);

      // Calculate estimated end time based on current time + estimated hours:minutes
      const [hours, minutes] = estimatedTime.split(":").map(Number);
      const estimatedUseTime = new Date();
      estimatedUseTime.setHours(hours);
      estimatedUseTime.setMinutes(minutes);

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
                Estimated usage time (hh:mm)
              </Label>
              <Input
                id={`est-time-${deviceId}`}
                type="time"
                value={estimatedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                min="00:05"
                max="24:00"
                className={timeError ? "border-red-500" : ""}
              />
              {timeError && (
                <p className="text-sm text-red-500">
                  Time must be in the future
                </p>
              )}
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
            <Button onClick={handleTurnOn} disabled={isLoading || timeError}>
              {isLoading ? "Turning On..." : "Turn On With Timer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
