import { z } from "zod";

export const commonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
};

export * from "zod";
