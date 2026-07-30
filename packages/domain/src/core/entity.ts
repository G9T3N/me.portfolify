import { type } from "arktype";
import { Uuid } from "./value-objects";

export const BaseEntity = type({
  id: Uuid,
  createdAt: "Date",
  updatedAt: "Date",
});

export const PublishableEntity = type({
  isPublished: "boolean",
  publishedAt: "Date | null",
});
