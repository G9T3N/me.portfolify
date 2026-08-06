import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@mrerr/env";
import * as schema from "../schema";

const createClient = () => {
  if (!serverEnv.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  // Use a singleton pattern for the postgres connection in development
  // to avoid exhausting connections during hot reloading.
  const globalConnection = global as typeof globalThis & {
    __db_connection__?: postgres.Sql;
  };

  if (!globalConnection.__db_connection__) {
    globalConnection.__db_connection__ = postgres(serverEnv.DATABASE_URL, {
      max: serverEnv.NODE_ENV === "production" ? 10 : 1,
      idle_timeout: 20,
    });
  }

  const queryClient = globalConnection.__db_connection__;
  return drizzle(queryClient, { schema });
};

// Lazy initialization: db is only created on first property access
let _db: ReturnType<typeof createClient> | null = null;

export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop, _receiver) {
    if (!_db) {
      _db = createClient();
    }
    return Reflect.get(_db, prop, _db);
  },
});

export type DbClient = ReturnType<typeof createClient>;
