"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface DeviceSwitchProps {
  id: string;
  isCurrentUser: boolean;
  userEmail: string;
  className?: string;
  onToggle?: (checked: boolean) => void;
}

export function DeviceSwitch({
  id,
  isCurrentUser,
  userEmail,
  className,
  onToggle,
}: DeviceSwitchProps) {
  return (
    <Switch
      disabled={!isCurrentUser}
      id={id}
      checked={true}
      onCheckedChange={onToggle}
      className={cn(
        "data-[state=checked]:bg-green-600",
        "pointer-events-auto",
        className,
      )}
      title={
        !isCurrentUser
          ? `Only ${userEmail} can turn off this device`
          : "Click to turn off this device"
      }
    />
  );
}

export function DeviceSwitchMobile({
  containerProps,
  switchProps,
}: {
  containerProps?: HTMLAttributes<HTMLDivElement>;
  switchProps: DeviceSwitchProps;
}) {
  return (
    <div
      className="absolute top-0 right-0 bottom-0 flex cursor-default items-center px-4"
      onClick={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      {...containerProps}
    >
      <DeviceSwitch {...switchProps} />
    </div>
  );
}
