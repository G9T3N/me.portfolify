import { type Type } from "arktype";
import { navigationSchema } from "./schema";

export type Navigation = typeof navigationSchema.infer;
