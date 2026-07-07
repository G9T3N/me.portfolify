import { type } from "arktype";
import { EMPLOYMENT_TYPES } from "./constants";

export const experienceSchema = type({
  company: "string > 0",
  role: "string > 0",
  employmentType: type("string").narrow((s: string): s is (typeof EMPLOYMENT_TYPES)[number] =>
    EMPLOYMENT_TYPES.includes(s as any),
  ),
  start: "Date",
  end: "Date | null",
  location: "string",
  highlights: "string[]",
});
