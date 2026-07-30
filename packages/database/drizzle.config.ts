import { defineConfig } from "drizzle-kit";

// Use non-strict true here to allow process.env evaluation from our env pkg later
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Expected to be loaded via external env, using placeholder for generation
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/mrerr",
  },
  verbose: true,
  strict: true,
});
