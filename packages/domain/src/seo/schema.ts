import { type } from "arktype";
import { BaseEntity, Url } from "../core";

export const seoSchema = BaseEntity.and(
  type({
    title: "string > 0",
    description: "string",
    canonical: Url.or("null"),
    openGraph: type({
      title: "string | null",
      description: "string | null",
      image: Url.or("null"),
      type: "string | null",
    }),
    twitter: type({
      card: "string | null",
      title: "string | null",
      description: "string | null",
      image: Url.or("null"),
    }),
  }),
);
