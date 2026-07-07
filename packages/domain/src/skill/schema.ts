import { type } from "arktype";

import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from "./constants";

export const skillSchema = type({
  category: type("string").narrow((s: string): s is (typeof SKILL_CATEGORIES)[number] =>
    SKILL_CATEGORIES.includes(s as any),
  ),
  name: "string > 0",
  proficiency: type("string").narrow((s: string): s is (typeof PROFICIENCY_LEVELS)[number] =>
    PROFICIENCY_LEVELS.includes(s as any),
  ),
  icon: "string | null",
});
