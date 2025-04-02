//istanbul ignore file
//TODO:: add tests for this file

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

//TODO:: remove this function once api implemented

// Define the structure of the usage response
interface UsageResponse {
  usage: {
    today_energy: number; // Energy value in watts
  };
}

// Define the simulateApiCall function
export async function simulateApiCall(
  _deviceId: string,
  isTurnOn: boolean,
  startTime?: string | null,
  date?: string | null,
): Promise<UsageResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network delay

  if (isTurnOn) {
    const energyValue = getEnergyValueForDate(date);
    return { usage: { today_energy: energyValue } };
  } else {
    if (!startTime) {
      throw new Error("startTime must be provided for turn-off action");
    }
    // Calculate realistic usage value based on startTime
    const duration = Date.now() - new Date(startTime).getTime();
    const calculatedValue = (duration / (1000 * 60 * 60)) * 10; // Example calculation
    return { usage: { today_energy: calculatedValue } };
  }
}

// Seeded random function
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Function to get energy value for a specific date
function getEnergyValueForDate(date?: string | null): number {
  if (!date) {
    throw new Error("date must be provided to get energy value");
  }
  const seed = new Date(date).getTime(); // Use the date as a seed
  return Math.floor(seededRandom(seed) * 100); // Generate a value between 0 and 100
}

// Helper function to get current time + 1 minute in HH:MM format
export const getCurrentTimePlusOneMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // Add 1 minute
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to validate if time is in the future
export const isTimeInFuture = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const estimatedTime = new Date();
  estimatedTime.setHours(hours);
  estimatedTime.setMinutes(minutes);
  estimatedTime.setSeconds(0); // Reset seconds for accurate comparison

  return estimatedTime > now;
};
