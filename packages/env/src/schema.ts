import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
});

export const clientSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
});
