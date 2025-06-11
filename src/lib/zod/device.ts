import { z } from "zod";
import { deviceUsageResponseSchema } from "./usage";

export const deviceOnResponseSchema = z
  .object({
    status: z.literal(1),
  })
  .extend(deviceUsageResponseSchema.shape);

export type DeviceOnResponse = z.infer<typeof deviceOnResponseSchema>;

export const deviceOffResponseSchema = z
  .object({
    status: z.literal(0),
  })
  .extend(deviceUsageResponseSchema.shape);

export type DeviceOffResponse = z.infer<typeof deviceOffResponseSchema>;
