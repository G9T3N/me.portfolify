import { type Type } from "arktype";
import { skillSchema } from "./schema";

export type Skill = typeof skillSchema.infer;
