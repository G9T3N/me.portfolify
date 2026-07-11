import { type } from "arktype";

export const seoSchema = type({
  title: "string > 0",
  description: "string",
  canonical: "string.url | null",
  openGraph: type({
    title: "string | null",
    description: "string | null",
    image: "string.url | null",
    type: "string | null",
  }),
  twitter: type({
    card: "string | null",
    title: "string | null",
    description: "string | null",
    image: "string.url | null",
  }),
});
