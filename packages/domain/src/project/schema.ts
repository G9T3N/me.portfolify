import { type } from "arktype";
import { PROJECT_STATUSES } from "./constants";

export const projectSchema = type({
  title: "string > 0",
  slug: "string > 0",
  summary: "string",
  description: "string",
  technologies: "string[]",
  repository: "string.url | null",
  demo: "string.url | null",
  images: "string.url[]",
  featured: "boolean",
  published: "boolean",
  status: type("string").narrow((s: string): s is (typeof PROJECT_STATUSES)[number] =>
    PROJECT_STATUSES.includes(s as any),
  ),
  createdAt: "Date",
  updatedAt: "Date",
});
