export const SKILL_CATEGORIES = [
  "language",
  "framework",
  "tool",
  "database",
  "cloud",
  "other",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];
