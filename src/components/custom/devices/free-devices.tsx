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
import { DeviceUsageTimePicker } from "./device-usage-time-picker";

interface FreeDevicesProps {
  devices: device[];
  canInteractWithDevice: boolean;
}

export function FreeDevices({
  devices,
  canInteractWithDevice,
}: FreeDevicesProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-4 text-2xl font-semibold">Available Devices</h2>

      {/* Desktop view */}
      <DesktopView
        devices={devices}
        canInteractWithDevice={canInteractWithDevice}
      />

      {/* Mobile view */}
      <MobileView
        devices={devices}
        canInteractWithDevice={canInteractWithDevice}
      />
    </div>
  );
}

function DesktopView({ devices, canInteractWithDevice }: FreeDevicesProps) {
  return (
    <div
      className="hidden rounded-md border md:block"
      data-testid="desktop-view"
    >
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-muted">
            <TableHead className="w-[90%] text-base">Device Name</TableHead>
            <TableHead className="text-base">Turn On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.length === 0 ? (
            <EmptyTableContent
              colSpan={2}
              message="No available devices found"
            />
          ) : (
            devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-normal">{device.alias}</TableCell>
                <TableCell>
                  <DeviceUsageTimePicker
                    deviceId={device.id}
                    deviceIp={device.ip_address}
                    canInteractWithDevice={canInteractWithDevice}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileView({ devices, canInteractWithDevice }: FreeDevicesProps) {
  return (
    <div className="space-y-4 md:hidden" data-testid="mobile-view">
      {devices.length === 0 ? (
        <div className="text-muted-foreground py-6 text-center">
          No available devices found
        </div>
      ) : (
        devices.map((device) => (
          <div
            key={device.id}
            className="bg-card text-card-foreground hover:shadow-accent-foreground/20 dark:hover:shadow-accent-foreground/50 rounded-lg border p-3 transition-shadow hover:shadow"
          >
            <div className="inline-flex w-full items-center justify-between">
              <span className="font-medium">{device.alias}</span>
              <DeviceUsageTimePicker
                deviceId={device.id}
                deviceIp={device.ip_address}
                canInteractWithDevice={canInteractWithDevice}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
