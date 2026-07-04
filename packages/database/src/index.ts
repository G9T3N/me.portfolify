import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@mrerr/env";

const connectionString = serverEnv.DATABASE_URL || "postgres://localhost:5432/mrerr";

export const client = postgres(connectionString);
export const db = drizzle(client);

export * from "./schema";
