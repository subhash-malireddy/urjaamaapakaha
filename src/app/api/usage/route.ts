import { NextResponse } from "next/server";
import { getRecentUsage } from "@/lib/data/usage";
import { serialize } from "@/lib/utils";

export async function GET() {
  try {
    const usage = await getRecentUsage();
    return NextResponse.json(serialize(usage));
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 },
    );
  }
}
