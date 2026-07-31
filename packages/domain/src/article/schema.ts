import { type } from "arktype";
import { ARTICLE_STATUSES } from "./constants";
import { BaseEntity, PublishableEntity, Slug, Url, Markdown } from "../core";

export const articleSchema = BaseEntity.and(PublishableEntity).and(
  type({
    title: "string > 0",
    slug: Slug,
    excerpt: "string",
    content: Markdown,
    coverImage: Url.or("null"),
    status: type.enumerated(...ARTICLE_STATUSES),
    tags: "string[]",
  }),
);

export const createArticleInputSchema = type({
  title: "string > 0",
  slug: Slug,
  excerpt: "string",
  content: Markdown,
  "coverImage?": Url.or("null").or("undefined"),
  status: type.enumerated(...ARTICLE_STATUSES),
  tags: "string[]",
  "isPublished?": "boolean | undefined",
  "publishedAt?": "Date | null | undefined",
});

export const updateArticleInputSchema = type({
  "title?": "string > 0 | undefined",
  "slug?": Slug.or("undefined"),
  "excerpt?": "string | undefined",
  "content?": Markdown.or("undefined"),
  "coverImage?": Url.or("null").or("undefined"),
  "status?": type.enumerated(...ARTICLE_STATUSES).or("undefined"),
  "tags?": "string[] | undefined",
  "isPublished?": "boolean | undefined",
  "publishedAt?": "Date | null | undefined",
});
