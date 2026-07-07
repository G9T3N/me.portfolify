export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "freelance",
  "internship",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
