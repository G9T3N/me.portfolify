import { type profileSchema } from "./schema";

export type Profile = typeof profileSchema.infer;
