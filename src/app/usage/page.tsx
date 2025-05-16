import ChartWithFilters from "@/components/custom/usage/chart-with-filters";
import { getAllDevicesOnlyIdAndAlias } from "@/lib/data/devices";
import { deviceSelectListResponseSchema } from "@/lib/zod/usage";

export default async function Usage() {
  // get all devices
  const devices = await getAllDevicesOnlyIdAndAlias();
  // we only need the device id and name
  const devicesWithIdAndName = deviceSelectListResponseSchema.parse(devices);
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-8 text-3xl font-bold">Usage Dashboard</h1>
      <div className="flex">
        <ChartWithFilters devices={devicesWithIdAndName} />
      </div>
    </div>
  );
}
