import { type } from "arktype";
import { MEDIA_TYPES } from "./constants";
import { BaseEntity, Url } from "../core";

export const mediaSchema = BaseEntity.and(
  type({
    type: type("string").narrow((s: string): s is (typeof MEDIA_TYPES)[number] =>
      MEDIA_TYPES.includes(s as any),
    ),
    alt: "string",
    width: "number | null",
    height: "number | null",
    mime: "string",
    source: Url,
  }),
);
