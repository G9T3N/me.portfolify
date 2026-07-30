import { type } from "arktype";
import { ARTICLE_STATUSES } from "./constants";
import { BaseEntity, PublishableEntity, Slug, Url, Markdown } from "../core";

export const articleSchema = BaseEntity.and(PublishableEntity).and(type({
  title: "string > 0",
  slug: Slug,
  excerpt: "string",
  content: Markdown,
  coverImage: Url.or("null"),
  status: type.enumerated(...ARTICLE_STATUSES),
  tags: "string[]",
}));
