import { type } from "arktype";

// Identifiers
export const Uuid = type("string.uuid");
export const Slug = type("string > 0").narrow((s, ctx) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) ? true : ctx.mustBe("a valid slug pattern (kebab-case)")
);

// Internet
export const Url = type("string.url");
export const Email = type("string.email");

// Content
export const Markdown = type("string"); // Basic string for now, could add parsing validations if needed
export const ImageUrl = type("string.url"); // Alias for clarity

// Localization
export const Locale = type("string > 0").narrow((s, ctx) =>
  /^[a-z]{2}(-[A-Z]{2})?$/.test(s) ? true : ctx.mustBe("a valid locale code (e.g., en, en-US)")
);
export const Timezone = type("string > 0"); // A basic non-empty string for TZ formats

// Visual
export const Color = type("string > 0").narrow((s, ctx) =>
  /^#([0-9A-Fa-f]{3}){1,2}$/i.test(s) ? true : ctx.mustBe("a valid hex color")
);
