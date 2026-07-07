import { type articleSchema } from "./schema";

export type Article = typeof articleSchema.infer;
