import { type } from "arktype";
import { NAVIGATION_TARGETS } from "./constants";
import { BaseEntity } from "../core";

export const navigationSchema = BaseEntity.and(type({
  label: "string > 0",
  href: "string > 0", // Can be path or URL
  order: "number",
  visibility: "boolean",
  target: type("string").narrow((s: string): s is (typeof NAVIGATION_TARGETS)[number] =>
    NAVIGATION_TARGETS.includes(s as any),
  ),
}));
