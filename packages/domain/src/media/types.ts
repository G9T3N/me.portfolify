import { type mediaSchema } from "./schema";

export type Media = typeof mediaSchema.infer;
