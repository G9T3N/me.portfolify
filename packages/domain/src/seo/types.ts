import { type Type } from "arktype";
import { seoSchema } from "./schema";

export type Seo = typeof seoSchema.infer;
