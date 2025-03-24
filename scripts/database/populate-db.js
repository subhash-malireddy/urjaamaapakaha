import { neon } from "@neondatabase/serverless";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

function generateDevices(count) {
  const devices = [];
  const usedAliases = new Set(); // For unique aliases
  const usedMacs = new Set(); // For unique MAC addresses
  const usedIPs = new Set(); // For unique IP addresses

  // Room to device mapping for realistic combinations
  const roomDeviceMap = {
    "Living Room": ["TV", "Light", "Fan", "Speaker", "AC", "Heater"],
    Kitchen: ["Microwave", "Light", "Blender", "Toaster", "Coffee Maker"],
    Bathroom: ["Light", "Fan", "Heater"],
    "Laundry Room": ["Light"],
    Office: ["Light", "Fan"],
    "Dining Room": ["Light", "Fan"],
    Garage: ["Light"],
  };

  // Create array of all possible room-device combinations
  const possibleCombinations = [];
  for (const [room, devices] of Object.entries(roomDeviceMap)) {
    devices.forEach((device) => {
      possibleCombinations.push(`${room} ${device}`);
    });
  }

  for (let i = 0; i < count; i++) {
    const id = crypto.randomBytes(16).toString("hex");

    // Generate unique MAC address using faker.internet.mac()
    let mac;
    do {
      mac = faker.internet.mac();
    } while (usedMacs.has(mac));
    usedMacs.add(mac);

    // Generate unique IP address
    let ip;
    do {
      ip = faker.internet.ip();
    } while (usedIPs.has(ip));
    usedIPs.add(ip);

    // Generate a unique alias
    let alias;
    do {
      alias = faker.helpers.arrayElement(possibleCombinations);

      // Add numerical identifier if we're running out of combinations
      if (usedAliases.size > possibleCombinations.length * 0.7) {
        alias += ` ${faker.number.int({ min: 1, max: 99 })}`;
      }

      // Ensure it fits in our 60 char limit
      alias = alias.substring(0, 60);
    } while (usedAliases.has(alias));
    usedAliases.add(alias);

    devices.push({
      id,
      mac_address: mac,
      ip_address: ip,
      alias: alias,
      is_archived: false,
      previous_aliases: [],
    });
  }
  return devices;
}

function generateUsage(devices, count, startDate, endDate) {
  const usageLogs = [];

  // Specific user emails as requested
  const userEmails = [
    "subhashmalireddy@gmail.com",
    "codeproinc.dev@gmail.com",
    "hammy.potter@hogmarts.com",
    "armani.danger@hogmarts.com",
    "doubledoor@hogmarts.com",
    "don.measly@hogmarts.com",
    "severe.snooze@hogmarts.com",
  ];

  // Step 1: Generate usage records with different start and end times
  for (let i = 0; i < count - Math.floor(count * 0.1); i++) {
    const userEmail = userEmails[i % userEmails.length]; // Cycle through the emails
    const device = faker.helpers.arrayElement(devices);

    const startTime = faker.date.between({ from: startDate, to: endDate });
    const durationHours = faker.number.float({
      min: 0.1,
      max: 12,
      precision: 0.1,
    });
    const endTime = new Date(
      startTime.getTime() + durationHours * 60 * 60 * 1000,
    );
    const estimatedUseTime = new Date(
      startTime.getTime() + (durationHours / 2) * 60 * 60 * 1000,
    );

    const consumptionRate = faker.number.float({
      min: 0.1,
      max: 2.0,
      precision: 0.01,
    });
    const consumption = parseFloat(
      (durationHours * consumptionRate).toFixed(2),
    );
    const chargeRate = faker.number.float({
      min: 0.15,
      max: 0.25,
      precision: 0.01,
    });
    const charge = parseFloat((consumption * chargeRate).toFixed(2));

    usageLogs.push({
      user_email: userEmail,
      start_date: startTime,
      end_date: endTime,
      estimated_use_time: estimatedUseTime,
      consumption,
      charge,
      device_id: device.id,
    });
  }

  // Step 2: Generate active usage records (start_date = end_date)
  const activeCount = Math.floor(count * 0.1); // 10% of records are active

  // Keep track of which devices are active to ensure uniqueness
  const activeDeviceIds = new Set();

  for (let i = 0; i < activeCount; i++) {
    const userEmail = userEmails[i % userEmails.length]; // Cycle through the emails

    // Find a device that isn't already active
    let device;
    do {
      device = faker.helpers.arrayElement(devices);
    } while (
      activeDeviceIds.has(device.id) &&
      activeDeviceIds.size < devices.length
    );

    // If all devices are already active, break out of the loop
    if (activeDeviceIds.has(device.id)) {
      break;
    }

    activeDeviceIds.add(device.id);

    const currentTime = new Date();
    const estimatedUseTime = faker.date.future({ refDate: currentTime });

    usageLogs.push({
      user_email: userEmail,
      start_date: currentTime,
      end_date: currentTime,
      estimated_use_time: estimatedUseTime,
      consumption: 0,
      charge: 0,
      device_id: device.id,
      is_active: true, // Flag to identify active records
    });
  }

  return usageLogs;
}

function generateActiveDevices(usageLogs) {
  return usageLogs
    .filter((log) => log.is_active)
    .map((log) => ({
      device_id: log.device_id,
      usage_record_id: null, // This will be filled after inserting usage records
    }));
}

async function insertData(devices, usageLogs, activeDevices) {
  const sql = neon(DATABASE_URL);
  try {
    // 1. Create transaction for devices - collect all device insert queries
    console.log("Preparing device insertion transaction...");
    const deviceQueries = devices.map(
      (device) =>
        sql`
                INSERT INTO device (id, mac_address, ip_address, alias, is_archived, previous_aliases)
                VALUES (${device.id}, ${device.mac_address}, ${device.ip_address}, ${device.alias}, ${device.is_archived}, ${device.previous_aliases})
            `,
    );

    // Execute device insertion as a single transaction
    console.log("Inserting devices in a transaction...");
    try {
      await sql.transaction(deviceQueries);
      console.log(`Successfully inserted ${deviceQueries.length} devices.`);
    } catch (error) {
      console.error(
        "Device transaction failed, all device inserts were rolled back:",
        error.message,
      );
      throw error; // Re-throw to stop further processing
    }

    // 2. Insert usage records and update activeDevices
    console.log("Preparing usage records insertion transaction...");
    // First collect all queries without executing them
    const usageQueries = [];

    for (const log of usageLogs) {
      usageQueries.push(
        sql`
                    INSERT INTO usage (user_email, start_date, end_date, estimated_use_time, consumption, charge, device_id)
                    VALUES (${log.user_email}, ${log.start_date}, ${log.end_date}, ${log.estimated_use_time}, ${log.consumption}, ${log.charge}, ${log.device_id})
                    RETURNING id
                `,
      );
    }

    // Execute usage insertion as a single transaction
    console.log("Inserting usage records in a transaction...");
    let usageResults;
    try {
      usageResults = await sql.transaction(usageQueries);
      console.log(
        `Successfully inserted ${usageQueries.length} usage records.`,
      );
    } catch (error) {
      console.error(
        "Usage records transaction failed, all usage record inserts were rolled back:",
        error.message,
      );
      throw error; // Re-throw to stop further processing
    }

    // Process results to update activeDevices
    console.log("Processing usage results for active devices...");
    const activeCount = usageLogs.reduce((count, log, index) => {
      if (
        log.is_active &&
        usageResults[index] &&
        usageResults[index].length > 0
      ) {
        const activeDevice = activeDevices.find(
          (ad) => ad.device_id === log.device_id,
        );
        if (activeDevice) {
          activeDevice.usage_record_id = usageResults[index][0].id;
          count++;
        }
      }
      return count;
    }, 0);
    console.log(`Found ${activeCount} active devices to insert.`);

    // 3. Create transaction for active devices
    console.log("Preparing active devices insertion transaction...");
    const activeDeviceQueries = activeDevices
      .filter((device) => device.usage_record_id) // Only include those with usage record IDs
      .map(
        (device) =>
          sql`
                    INSERT INTO active_device (device_id, usage_record_id)
                    VALUES (${device.device_id}, ${device.usage_record_id})
                `,
      );

    // Execute active device insertion as a single transaction (if any exist)
    if (activeDeviceQueries.length > 0) {
      console.log("Inserting active devices in a transaction...");
      try {
        await sql.transaction(activeDeviceQueries);
        console.log(
          `Successfully inserted ${activeDeviceQueries.length} active devices.`,
        );
      } catch (error) {
        console.error(
          "Active devices transaction failed, all active device inserts were rolled back:",
          error.message,
        );
        throw error;
      }
    } else {
      console.log("No active devices to insert.");
    }

    console.log("Data insertion completed!");
  } catch (err) {
    console.error("Error inserting data:", err);
    throw err; // Re-throw to allow the caller to handle it
  }
}

async function generateAndInsertData(
  deviceCount = 10,
  usageCount = 50,
  startDateStr = "2025-01-01",
  endDateStr = "2025-03-22",
) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  console.log(
    `Generating ${deviceCount} devices and ${usageCount} usage records...`,
  );

  const devices = generateDevices(deviceCount);
  const usageLogs = generateUsage(devices, usageCount, startDate, endDate);
  const activeDevices = generateActiveDevices(usageLogs);

  console.log("Generated data. Inserting into database...");
  await insertData(devices, usageLogs, activeDevices);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  generateAndInsertData(
    parseInt(args[0]) || 10,
    parseInt(args[1]) || 50,
    args[2] || "2025-01-01",
    args[3] || "2025-02-28",
  )
    .then(() => console.log("Script completed!"))
    .catch((err) => console.error("Script failed:", err));
}

module.exports = {
  generateDevices,
  generateUsage,
  insertData,
  generateAndInsertData,
};
