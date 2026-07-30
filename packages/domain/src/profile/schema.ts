import { type } from "arktype";
import { AVAILABILITY_STATUSES } from "./constants";
import { BaseEntity, Url, Email, Timezone } from "../core";

export const profileSchema = BaseEntity.and(
  type({
    name: "string > 0",
    headline: "string > 0",
    biography: "string",
    avatar: Url.or("null"),
    location: "string",
    timezone: Timezone,
    availability: type("string").narrow((s: string): s is (typeof AVAILABILITY_STATUSES)[number] =>
      AVAILABILITY_STATUSES.includes(s as any),
    ),
    resume: Url.or("null"),
    contact: type({
      email: Email,
      phone: "string | null",
    }),
  }),
);
