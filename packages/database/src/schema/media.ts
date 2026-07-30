import { pgTable, uuid, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projectTable } from "./project";

export const mediaTable = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  alt: text("alt").notNull(),
  width: integer("width"),
  height: integer("height"),
  mime: text("mime").notNull(),
  source: text("source").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectMediaTable = pgTable("project_media", {
  projectId: uuid("project_id").notNull().references(() => projectTable.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => mediaTable.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.projectId, t.mediaId] }),
}));

export const projectMediaRelations = relations(projectMediaTable, ({ one }) => ({
  project: one(projectTable, {
    fields: [projectMediaTable.projectId],
    references: [projectTable.id],
  }),
  media: one(mediaTable, {
    fields: [projectMediaTable.mediaId],
    references: [mediaTable.id],
  }),
}));
