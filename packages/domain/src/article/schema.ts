import { type } from "arktype";

import { ARTICLE_STATUSES } from "./constants";

export const articleSchema = type({
  title: "string > 0",
  slug: "string > 0",
  excerpt: "string",
  content: "string",
  coverImage: "string.url | null",
  status: type.enumerated(...ARTICLE_STATUSES),
  tags: "string[]",
  publishedAt: "Date | null",
  createdAt: "Date",
  updatedAt: "Date",
});
