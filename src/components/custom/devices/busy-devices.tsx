import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { EmptyTableContent } from "./empty-table-content";
import type { device } from "@prisma/client";

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
      <div className="rounded-md border">
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
                /* istanbul ignore next */
                const userEmail = device.usage?.user_email || "Unknown";
                const estimatedEndTime = device.usage?.estimated_use_time
                  ? new Date(device.usage.estimated_use_time).toLocaleString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )
                  : "Not specified";
                const isCurrentUser = userEmail === currentUserEmail;

                return (
                  <TableRow key={device.id}>
                    <TableCell className="font-normal">
                      {device.alias}
                    </TableCell>
                    <TableCell>{userEmail}</TableCell>
                    <TableCell>{estimatedEndTime}</TableCell>
                    <TableCell>
                      <Switch
                        disabled={!isCurrentUser}
                        id={`turn-off-${device.id}`}
                        checked={true}
                        className="data-[state=checked]:bg-green-600"
                        title={
                          !isCurrentUser
                            ? `Only ${userEmail} can turn off this device`
                            : "Click to turn off this device"
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
