"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { turnOnDeviceAction } from "@/lib/actions/device-actions";

interface FreeDeviceSwitchProps {
  deviceId: string;
}

export function FreeDeviceSwitch({ deviceId }: FreeDeviceSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    // If already loading, prevent multiple clicks
    //istanbul ignore next -- if button is disabled, it can't be clicked but leaving this here just in case.
    if (isLoading) return;

    try {
      setIsLoading(true);

      const result = await turnOnDeviceAction(deviceId);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error turning on device:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Switch
      id={`turn-on-${deviceId}`}
      disabled={isLoading}
      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600 dark:data-[state=checked]:bg-green-600 dark:data-[state=unchecked]:bg-red-600"
      title="Click to turn on this device"
      onCheckedChange={handleToggle}
    />
  );
}
