import { type } from "arktype";
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from "./constants";
import { BaseEntity, Slug } from "../core";

export const skillSchema = BaseEntity.and(
  type({
    category: type("string").narrow((s: string): s is (typeof SKILL_CATEGORIES)[number] =>
      SKILL_CATEGORIES.includes(s as any),
    ),
    name: "string > 0",
    slug: Slug, // Useful for URL lookup even if not currently used, standardizing
    proficiency: type("string").narrow((s: string): s is (typeof PROFICIENCY_LEVELS)[number] =>
      PROFICIENCY_LEVELS.includes(s as any),
    ),
    icon: "string | null", // Either icon name or simple string
  }),
);
