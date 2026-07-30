import {
  type projectSchema,
  type createProjectInputSchema,
  type updateProjectInputSchema,
} from "./schema";

export type Project = typeof projectSchema.infer;
export type CreateProjectInput = typeof createProjectInputSchema.infer;
export type UpdateProjectInput = typeof updateProjectInputSchema.infer;
