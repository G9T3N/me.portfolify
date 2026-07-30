import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const experienceTable = pgTable("experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  employmentType: text("employment_type").notNull(),
  start: timestamp("start_date").notNull(),
  end: timestamp("end_date"),
  location: text("location").notNull(),
  highlights: text("highlights").array().notNull().default([]), // Value object, array is fine

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
