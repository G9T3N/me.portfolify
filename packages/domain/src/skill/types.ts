import { type skillSchema } from "./schema";

export type Skill = typeof skillSchema.infer;
