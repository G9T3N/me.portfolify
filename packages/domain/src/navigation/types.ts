import { type navigationSchema } from "./schema";

export type Navigation = typeof navigationSchema.infer;
