"use client";

import { ComponentProps } from "react";
import { BusyDeviceSwitch } from "./busy-device-switch";

export function BusyDeviceSwitchMobile(
  props: ComponentProps<typeof BusyDeviceSwitch>,
) {
  return (
    <div
      className="absolute top-0 right-0 bottom-0 flex cursor-default items-center p-3"
      onClick={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      data-testid="busy-device-switch-mobile"
    >
      <BusyDeviceSwitch
        deviceId={props.deviceId}
        deviceIp={props.deviceIp}
        isCurrentUser={props.isCurrentUser}
        userEmail={props.userEmail}
      />
    </div>
  );
}
