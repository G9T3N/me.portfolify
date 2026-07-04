import { clientSchema } from "./schema";

export const clientEnv = clientSchema.parse({
  VITE_API_URL: typeof process !== "undefined" ? process.env.VITE_API_URL : undefined,
});
