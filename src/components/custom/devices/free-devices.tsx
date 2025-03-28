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

interface FreeDevicesProps {
  devices: device[];
}

export function FreeDevices({ devices }: FreeDevicesProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-4 text-2xl font-semibold">Available Devices</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-muted">
              <TableHead className="w-[60%] text-base">Device Name</TableHead>
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
                    <Switch
                      disabled
                      id={`turn-on-${device.id}`}
                      title="Coming soon! Button will be enabled in future updates"
                      className="data-[state=unchecked]:bg-red-600 dark:data-[state=unchecked]:bg-red-600"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
