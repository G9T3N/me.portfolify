import { type Type } from "arktype";
import { articleSchema } from "./schema";

export type Article = typeof articleSchema.infer;
