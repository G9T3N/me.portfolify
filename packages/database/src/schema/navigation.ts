import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const navigationTable = pgTable("navigation", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  order: integer("order").notNull(),
  visibility: boolean("visibility").notNull().default(true),
  target: text("target").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
