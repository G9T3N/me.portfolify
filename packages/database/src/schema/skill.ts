import { pgTable, uuid, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { experienceTable } from "./experience";

export const skillTable = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  proficiency: text("proficiency").notNull(),
  icon: text("icon"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const experienceSkillsTable = pgTable(
  "experience_skills",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experienceTable.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skillTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.experienceId, t.skillId] }),
  }),
);

export const experienceRelations = relations(experienceTable, ({ many }) => ({
  experienceSkills: many(experienceSkillsTable),
}));

export const skillRelations = relations(skillTable, ({ many }) => ({
  experienceSkills: many(experienceSkillsTable),
}));

export const experienceSkillsRelations = relations(experienceSkillsTable, ({ one }) => ({
  experience: one(experienceTable, {
    fields: [experienceSkillsTable.experienceId],
    references: [experienceTable.id],
  }),
  skill: one(skillTable, {
    fields: [experienceSkillsTable.skillId],
    references: [skillTable.id],
  }),
}));
