import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyTableContent } from "./empty-table-content";
import type { device } from "@prisma/client";
import { BusyDeviceSwitchMobile } from "./busy-device-switch-mobile";
import styles from "./busy-devices.module.css";
import { BusyDeviceSwitch } from "./busy-device-switch";
import { InlineTimeEdit } from "./inline-time-edit";

interface BusyDevicesProps {
  devices: (device & {
    usage: { user_email: string; estimated_use_time: Date | null };
  })[];
  currentUserEmail: string;
}

export function BusyDevices({ devices, currentUserEmail }: BusyDevicesProps) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">In-Use Devices</h2>

      {/* Desktop view */}
      <DesktopView devices={devices} currentUserEmail={currentUserEmail} />

      {/* Mobile view */}
      <MobileView devices={devices} currentUserEmail={currentUserEmail} />
    </div>
  );
}

function DesktopView({ devices, currentUserEmail }: BusyDevicesProps) {
  return (
    <div
      className="hidden rounded-md border md:block"
      data-testid="desktop-view"
    >
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-muted">
            <TableHead className="w-[30%] text-base">Device Name</TableHead>
            <TableHead className="w-[30%] text-base">Being Used By</TableHead>
            <TableHead className="w-[30%] text-base">
              Estimated Use Until
            </TableHead>
            <TableHead className="text-base">Turn Off</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.length === 0 ? (
            <EmptyTableContent
              colSpan={4}
              message="No devices currently in use"
            />
          ) : (
            devices.map((device) => {
              /*istanbul ignore next*/
              const userEmail = device.usage?.user_email || "Unknown";
              const estimatedUseUntil = device.usage?.estimated_use_time;
              const isCurrentUser = userEmail === currentUserEmail;

              return (
                <TableRow key={device.id}>
                  <TableCell className="font-normal">{device.alias}</TableCell>
                  <TableCell>{userEmail}</TableCell>
                  <TableCell>
                    <EstimatedTimeDisplay
                      deviceId={device.id}
                      estimatedTime={estimatedUseUntil}
                      isCurrentUser={isCurrentUser}
                    />
                  </TableCell>
                  <TableCell>
                    <BusyDeviceSwitch
                      deviceId={device.id}
                      deviceIp={device.ip_address}
                      isCurrentUser={isCurrentUser}
                      userEmail={userEmail}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileView({ devices, currentUserEmail }: BusyDevicesProps) {
  return (
    <div className="space-y-4 md:hidden" data-testid="mobile-view">
      {devices.length === 0 ? (
        <div className="text-muted-foreground py-6 text-center">
          No devices currently in use
        </div>
      ) : (
        devices.map((device) => {
          /*istanbul ignore next*/
          const userEmail = device.usage?.user_email || "Unknown";
          const estimatedUseUntil = device.usage?.estimated_use_time;
          const isCurrentUser = userEmail === currentUserEmail;

          return (
            <details
              key={device.id}
              className={`group bg-card text-card-foreground hover:shadow-accent-foreground/20 dark:hover:shadow-accent-foreground/50 rounded-lg border transition-shadow hover:shadow ${styles.details}`}
              name="device-details" // needed to auto-close other opened one.
            >
              <summary
                className={`relative ${styles.summary} rounded-t-lg px-3`}
              >
                <div className="inline-flex items-center justify-between py-3 pl-1">
                  <span className="font-medium">{device.alias}</span>
                  <BusyDeviceSwitchMobile
                    deviceId={device.id}
                    deviceIp={device.ip_address}
                    isCurrentUser={isCurrentUser}
                    userEmail={userEmail}
                  />
                </div>
              </summary>
              <div className="space-y-2 px-4 pt-1 pb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Being Used By:</span>
                  <span>{userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Until:
                  </span>
                  <span>
                    <EstimatedTimeDisplay
                      deviceId={device.id}
                      estimatedTime={estimatedUseUntil}
                      isCurrentUser={isCurrentUser}
                    />
                  </span>
                </div>
              </div>
            </details>
          );
        })
      )}
    </div>
  );
}

// Component to display estimated time (either editable or read-only)
function EstimatedTimeDisplay({
  deviceId,
  estimatedTime,
  isCurrentUser,
}: {
  deviceId: string;
  estimatedTime: Date | null;
  isCurrentUser: boolean;
}) {
  return isCurrentUser ? (
    <InlineTimeEdit deviceId={deviceId} estimatedUseUntil={estimatedTime} />
  ) : (
    formatEstimatedTime(estimatedTime)
  );
}

// Helper function to format estimated time
const formatEstimatedTime = (date: Date | null): string => {
  if (!date) return "Not specified";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
