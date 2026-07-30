import { type } from "arktype";
import { PROJECT_STATUSES } from "./constants";
import { BaseEntity, PublishableEntity, Slug, Url, Markdown, ImageUrl } from "../core";

export const projectSchema = BaseEntity.and(PublishableEntity).and(type({
  title: "string > 0",
  slug: Slug,
  summary: "string",
  description: Markdown,
  technologies: "string[]",
  repository: Url.or("null"),
  demo: Url.or("null"),
  images: ImageUrl.array(),
  featured: "boolean",
  status: type("string").narrow((s: string): s is (typeof PROJECT_STATUSES)[number] =>
    PROJECT_STATUSES.includes(s as any),
  )
}));
