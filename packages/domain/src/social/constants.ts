export const SOCIAL_PLATFORMS = [
  "github",
  "twitter",
  "linkedin",
  "youtube",
  "website",
  "other",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
