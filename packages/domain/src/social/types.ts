import { type socialLinkSchema } from "./schema";

export type SocialLink = typeof socialLinkSchema.infer;
