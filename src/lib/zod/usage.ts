import { z } from "zod";

// zod schema for device list response
export const deviceSelectListResponseSchema = z.array(
  z.object({
    id: z.string(),
    alias: z.string().min(1),
  }),
);

export type DeviceSelectionList = z.infer<
  typeof deviceSelectListResponseSchema
>;
