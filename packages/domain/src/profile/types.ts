import { type Type } from "arktype";
import { profileSchema } from "./schema";

export type Profile = typeof profileSchema.infer;
