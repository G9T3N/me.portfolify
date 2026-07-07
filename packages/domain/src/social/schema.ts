import { type } from "arktype";
import { SOCIAL_PLATFORMS } from "./constants";

export const socialLinkSchema = type({
  platform: type("string").narrow((s: string): s is (typeof SOCIAL_PLATFORMS)[number] =>
    SOCIAL_PLATFORMS.includes(s as any),
  ),
  url: "string.url",
  label: "string",
});
