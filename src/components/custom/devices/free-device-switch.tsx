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
    if (isLoading) return;

    try {
      // Set loading state
      setIsLoading(true);

      // Call the server action to turn on the device
      const result = await turnOnDeviceAction(deviceId);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error turning on device:", error);
    } finally {
      // Reset loading state
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
