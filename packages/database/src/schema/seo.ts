import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

// Represents a global SEO configuration or default
export const seoTable = pgTable("seo", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  canonical: text("canonical"),

  openGraphTitle: text("og_title"),
  openGraphDescription: text("og_description"),
  openGraphImage: text("og_image"),
  openGraphType: text("og_type"),

  twitterCard: text("twitter_card"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
