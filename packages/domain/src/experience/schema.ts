import { type } from "arktype";

import { EMPLOYMENT_TYPES } from "./constants";

export const experienceSchema = type({
  company: "string > 0",
  role: "string > 0",
  employmentType: type.enumerated(...EMPLOYMENT_TYPES),
  start: "Date",
  end: "Date | null",
  location: "string",
  highlights: "string[]",
}).narrow((exp, ctx) => {
  if (exp.end !== null && exp.end < exp.start) {
    return ctx.mustBe("end date on or after start date");
  }
  return true;
});
