import { type } from "arktype";

import { ARTICLE_STATUSES } from "./constants";

export const articleSchema = type({
  title: "string > 0",
  slug: "string > 0",
  excerpt: "string",
  content: "string",
  coverImage: "string.url | null",
  status: type("string").narrow((s: string): s is (typeof ARTICLE_STATUSES)[number] =>
    ARTICLE_STATUSES.includes(s as any),
  ),
  tags: "string[]",
  publishedAt: "Date | null",
  createdAt: "Date",
  updatedAt: "Date",
});
