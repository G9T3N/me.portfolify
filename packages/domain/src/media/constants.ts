export const MEDIA_TYPES = ["image", "video", "document"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
