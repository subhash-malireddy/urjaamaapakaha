"use client";

import { Switch } from "@/components/ui/switch";

interface FreeDeviceSwitchProps {
  deviceId: string;
  onCheckedChange: (isOn: boolean) => void;
  disabled?: boolean;
  checked?: boolean;
}

export function FreeDeviceSwitch({
  deviceId,
  onCheckedChange,
  disabled = false,
  checked = false,
}: FreeDeviceSwitchProps) {
  return (
    <Switch
      id={`turn-on-${deviceId}`}
      disabled={disabled}
      checked={checked}
      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600 dark:data-[state=checked]:bg-green-600 dark:data-[state=unchecked]:bg-red-600"
      title={!disabled ? "Click to turn on this device" : ""}
      onCheckedChange={onCheckedChange}
    />
  );
}
