"use client";

import { Switch } from "@/components/ui/switch";
import { ComponentProps, HTMLAttributes } from "react";

export function DeviceSwitchMobile({
  containerProps,
  switchProps,
}: {
  containerProps?: HTMLAttributes<HTMLDivElement>;
  switchProps?: ComponentProps<typeof Switch>;
}) {
  return (
    <div
      className="absolute top-0 right-0 bottom-0 flex cursor-default items-center p-3"
      onClick={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      {...containerProps}
    >
      <Switch {...switchProps} />
    </div>
  );
}
