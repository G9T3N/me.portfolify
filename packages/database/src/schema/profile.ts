import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { socialLinkTable } from "./social";

export const profileTable = pgTable("profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  headline: text("headline").notNull(),
  biography: text("biography").notNull(),
  avatar: text("avatar"),
  location: text("location").notNull(),
  timezone: text("timezone").notNull(),
  availability: text("availability").notNull(),
  resume: text("resume"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const profileRelations = relations(profileTable, ({ many }) => ({
  socialLinks: many(socialLinkTable),
}));
