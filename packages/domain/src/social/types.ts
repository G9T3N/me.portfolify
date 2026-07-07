import { type Type } from "arktype";
import { socialLinkSchema } from "./schema";

export type SocialLink = typeof socialLinkSchema.infer;
