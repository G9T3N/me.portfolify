import { pgTable, uuid, text, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projectTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  repository: text("repository"),
  demo: text("demo"),
  images: text("images").array().notNull().default([]), // Simple array for images based on instructions
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull(),

  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const technologyTable = pgTable("technologies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const projectTechnologiesTable = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectTable.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technologyTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.technologyId] }),
  }),
);

export const projectRelations = relations(projectTable, ({ many }) => ({
  projectTechnologies: many(projectTechnologiesTable),
}));

export const technologyRelations = relations(technologyTable, ({ many }) => ({
  projectTechnologies: many(projectTechnologiesTable),
}));

export const projectTechnologiesRelations = relations(projectTechnologiesTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [projectTechnologiesTable.projectId],
    references: [projectTable.id],
  }),
  technology: one(technologyTable, {
    fields: [projectTechnologiesTable.technologyId],
    references: [technologyTable.id],
  }),
}));
