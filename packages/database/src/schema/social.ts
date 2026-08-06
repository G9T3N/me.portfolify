import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profileTable } from "./profile";

export const socialLinkTable = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profileTable.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  label: text("label").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  profileIdUrlUnique: unique("social_links_profile_id_url_unique").on(t.profileId, t.url),
}));

export const socialLinkRelations = relations(socialLinkTable, ({ one }) => ({
  profile: one(profileTable, {
    fields: [socialLinkTable.profileId],
    references: [profileTable.id],
  }),
}));
