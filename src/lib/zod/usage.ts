import { z } from "zod";

// zod schema for device list response
export const deviceListResponseSchema = z.array(
  z.object({
    id: z.string(),
    alias: z.string().min(1),
  }),
);
