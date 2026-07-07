import { type Type } from "arktype";
import { projectSchema } from "./schema";

export type Project = typeof projectSchema.infer;
