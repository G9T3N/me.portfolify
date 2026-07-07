import { type } from "arktype";
import { THEME_MODES } from "./constants";

export const settingsSchema = type({
  theme: type("string").narrow((s: string): s is (typeof THEME_MODES)[number] =>
    THEME_MODES.includes(s as any),
  ),
  analyticsEnabled: "boolean",
  // additional platform settings
});
