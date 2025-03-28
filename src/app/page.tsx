import { auth } from "./auth";
import { getDevicesWithStatus } from "@/lib/data/devices";
import { FreeDevices } from "@/components/custom/devices/free-devices";
import { BusyDevices } from "@/components/custom/devices/busy-devices";

export default async function Home() {
  const session = await auth();
  const userEmail = session?.user?.email || "";

  // Fetch devices with status
  const { freeDevices, busyDevices } = await getDevicesWithStatus();

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-8 text-3xl font-bold">Device Dashboard</h1>
      <FreeDevices devices={freeDevices} />
      <BusyDevices devices={busyDevices} currentUserEmail={userEmail} />
    </div>
  );
}
