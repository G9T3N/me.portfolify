import { type } from "arktype";

import { AVAILABILITY_STATUSES } from "./constants";

export const profileSchema = type({
  name: "string > 0",
  headline: "string > 0",
  biography: "string",
  avatar: "string.url | null",
  location: "string",
  timezone: "string",
  availability: type("string").narrow((s: string): s is (typeof AVAILABILITY_STATUSES)[number] =>
    AVAILABILITY_STATUSES.includes(s as any),
  ),
  resume: "string.url | null",
  contact: type({
    email: "string.email",
    phone: "string | null",
  }),
});
