import { auth } from "@/auth";
import ChartWithFilters from "@/components/custom/usage/chart-with-filters";
import { getAllDevicesOnlyIdAndAlias } from "@/lib/data/devices";

export default async function Usage() {
  const devicesWithIdAndName = await getAllDevicesOnlyIdAndAlias();
  const session = await auth();
  const role = session?.user?.role;
  const isMember = role === "member";
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-8 text-3xl font-bold">Usage Dashboard</h1>
      <div className="flex">
        <ChartWithFilters devices={devicesWithIdAndName} isMember={isMember} />
      </div>
    </div>
  );
}
