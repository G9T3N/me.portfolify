import { serverEnv } from "@mrerr/env";

export const isProduction = serverEnv.NODE_ENV === "production";

// Centralized Session Security Configurations (Section 11, 40)
export const securityConfig = {
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days session expiration
    updateAge: 60 * 60 * 24, // 1 day update age (refresh window)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  cookie: {
    secure: isProduction,
    sameSite: "lax" as const,
    httpOnly: true,
  },
  // Built-in Better Auth rate limiting configurations (Section 27)
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 10, // 10 requests max per window for credential checks
  },
};
