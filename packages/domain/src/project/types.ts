import { type projectSchema } from "./schema";

export type Project = typeof projectSchema.infer;
