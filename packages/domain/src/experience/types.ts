import { type Type } from "arktype";
import { experienceSchema } from "./schema";

export type Experience = typeof experienceSchema.infer;
