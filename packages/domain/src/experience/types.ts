import { type experienceSchema } from "./schema";

export type Experience = typeof experienceSchema.infer;
