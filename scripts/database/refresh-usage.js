import { neon } from "@neondatabase/serverless";
import { generateUsage } from "./populate-db.js";

const DATABASE_URL = process.env.DATABASE_URL;
const BILLING_START_DATE =
  process.env.NEXT_PUBLIC_BILLING_START_DATE ||
  new Date().toISOString().split("T")[0];

async function clearActiveUsages() {
  const sql = neon(DATABASE_URL);
  try {
    console.log("Clearing active usages...");
    await sql`DELETE FROM active_usage`;
  } catch (error) {
    console.error("Error clearing active usages:", error);
    throw error;
  }
}

async function clearUsageTable() {
  const sql = neon(DATABASE_URL);
  try {
    console.log("Clearing usage table...");
    await sql`DELETE FROM usage`;
    console.log("Usage table cleared successfully");
  } catch (error) {
    console.error("Error clearing usage table:", error);
    throw error;
  }
}

export async function refreshUsageData(startDateStr = BILLING_START_DATE) {
  const sql = neon(DATABASE_URL);
  try {
    // Clear active usages first
    await clearActiveUsages();
    // Clear existing usage data
    await clearUsageTable();

    // Get all active devices
    const devices = await sql`SELECT * FROM device WHERE is_archived = false`;
    console.log(`Found ${devices.length} active devices`);

    // Calculate date range
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 100);

    // Generate usage records
    const usageLogs = generateUsage(devices, 100, startDate, endDate);

    // Insert usage records
    console.log("Inserting new usage records...");
    const usageQueries = usageLogs.map(
      (log) =>
        sql`
        INSERT INTO usage (user_email, start_date, end_date, estimated_use_time, consumption, charge, device_id)
        VALUES (${log.user_email}, ${log.start_date}, ${log.end_date}, ${log.estimated_use_time}, ${log.consumption}, ${log.charge}, ${log.device_id})
      `,
    );

    await sql.transaction(usageQueries);
    console.log(`Successfully inserted ${usageLogs.length} usage records`);
  } catch (error) {
    console.error("Error refreshing usage data:", error);
    throw error;
  }
}

console.log("process.argv[1]:: ", process.argv[1]);
console.log("import.meta.url:: ", import.meta.url);
// Run the script if called directly
if (import.meta.url.includes("refresh-usage.js")) {
  const startDate = process.argv[2] || BILLING_START_DATE;
  refreshUsageData(startDate)
    .then(() => console.log("Usage data refresh completed!"))
    .catch((err) => console.error("Script failed:", err));
}
