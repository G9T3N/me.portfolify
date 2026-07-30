import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  theme: text("theme").notNull(),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
