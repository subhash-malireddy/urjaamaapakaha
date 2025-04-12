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
    try {
      setIsLoading(true);
      const result = await turnOffDeviceAction(deviceId, deviceIp);
      if (!result.success) {
        // If the action fails, revert the switch state
        setIsSwitchOn(true);
        throw new Error(result.error);
      }
      setIsSwitchOn(false);
    } catch (error) {
      console.error("Failed to turn off device:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Switch
      id={`turn-off-${deviceId}`}
      className="pointer-events-auto data-[state=checked]:bg-green-600"
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
