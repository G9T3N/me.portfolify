import { type Type } from "arktype";
import { settingsSchema } from "./schema";

export type Settings = typeof settingsSchema.infer;
