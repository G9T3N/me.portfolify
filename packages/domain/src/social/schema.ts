import { type } from "arktype";
import { SOCIAL_PLATFORMS } from "./constants";
import { BaseEntity, Url } from "../core";

export const socialLinkSchema = BaseEntity.and(
  type({
    platform: type("string").narrow((s: string): s is (typeof SOCIAL_PLATFORMS)[number] =>
      SOCIAL_PLATFORMS.includes(s as any),
    ),
    url: Url,
    label: "string",
  }),
);
