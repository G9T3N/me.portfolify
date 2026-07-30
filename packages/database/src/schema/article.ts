import { pgTable, uuid, text, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const articleTable = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  status: text("status").notNull(),

  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tagTable = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const articleTagsTable = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articleTable.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tagTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.tagId] }),
  }),
);

export const articleRelations = relations(articleTable, ({ many }) => ({
  articleTags: many(articleTagsTable),
}));

export const tagRelations = relations(tagTable, ({ many }) => ({
  articleTags: many(articleTagsTable),
}));

export const articleTagsRelations = relations(articleTagsTable, ({ one }) => ({
  article: one(articleTable, {
    fields: [articleTagsTable.articleId],
    references: [articleTable.id],
  }),
  tag: one(tagTable, {
    fields: [articleTagsTable.tagId],
    references: [tagTable.id],
  }),
}));
