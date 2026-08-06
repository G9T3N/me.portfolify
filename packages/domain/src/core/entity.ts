import { type } from "arktype";
import { Uuid } from "./value-objects";

export const BaseEntity = type({
  id: Uuid,
  createdAt: "Date",
  updatedAt: "Date",
});

export const PublishableEntity = type({
  "isPublished": "boolean",
  "publishedAt": "Date | null",
}).narrow((entity): entity is { isPublished: boolean; publishedAt: Date | null } => {
  // When published, publishedAt must be a Date (not null)
  if (entity.isPublished && entity.publishedAt === null) {
    return false;
  }
  return true;
});
