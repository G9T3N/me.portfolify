import { type } from "arktype";
import { EMPLOYMENT_TYPES } from "./constants";
import { BaseEntity } from "../core";

export const experienceSchema = BaseEntity.and(
  type({
    company: "string > 0",
    role: "string > 0",
    employmentType: type.enumerated(...EMPLOYMENT_TYPES),
    start: "Date",
    end: "Date | null",
    location: "string",
    highlights: "string[]", // Can be Markdown or plain text
  }).narrow((exp, ctx) => {
    if (exp.end !== null && exp.end < exp.start) {
      return ctx.mustBe("end date on or after start date");
    }
    return true;
  }),
);
