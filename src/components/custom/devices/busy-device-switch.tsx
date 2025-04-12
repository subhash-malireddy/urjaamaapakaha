"use client";

import { Switch } from "@/components/ui/switch";
import { turnOffDeviceAction } from "@/lib/actions/device-actions";
import { useState } from "react";

interface BusyDeviceSwitchProps {
  deviceId: string;
  deviceIp: string;
  isCurrentUser: boolean;
  userEmail: string;
}

export function BusyDeviceSwitch({
  deviceId,
  deviceIp,
  isCurrentUser,
  userEmail,
}: BusyDeviceSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  const handleTurnOff = async () => {
    // istanbul ignore next -- The switch is disabled if the user is not the current user
    if (!isCurrentUser) return;

    try {
      setIsLoading(true);
      // Set switch state immediately for better UX
      setIsSwitchOn(false);

      const result = await turnOffDeviceAction(deviceId, deviceIp);
      if (!result.success) {
        // If the action fails, revert the switch state
        setIsSwitchOn(true);
        setIsLoading(false);
        throw new Error(result.error);
      }
      // Don't set loading to false on success - let revalidation handle it
    } catch (error) {
      console.error("Failed to turn off device:", error);
      // Revert switch state on error
      setIsSwitchOn(true);
      setIsLoading(false);
    }
  };

  return (
    <Switch
      id={`turn-off-${deviceId}`}
      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600 dark:data-[state=checked]:bg-green-600 dark:data-[state=unchecked]:bg-red-600"
      checked={isSwitchOn}
      title={
        !isCurrentUser
          ? `Only ${userEmail} can turn off this device`
          : "Click to turn off this device"
      }
      disabled={!isCurrentUser || isLoading}
      onCheckedChange={handleTurnOff}
    />
  );
}
