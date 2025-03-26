import { NextResponse } from "next/server";
import { getDevicesWithStatus } from "@/lib/data/devices";
import { serialize } from "@/lib/utils";

export async function GET() {
  try {
    const devices = await getDevicesWithStatus();
    return NextResponse.json(serialize(devices));
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 },
    );
  }
}
