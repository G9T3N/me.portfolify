import { type Type } from "arktype";
import { mediaSchema } from "./schema";

export type Media = typeof mediaSchema.infer;
