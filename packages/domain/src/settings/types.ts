import { type settingsSchema } from "./schema";

export type Settings = typeof settingsSchema.infer;
