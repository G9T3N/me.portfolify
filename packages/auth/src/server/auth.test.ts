import { describe, it, expect, vi } from "vitest";
import { checkPermission } from "./permissions";
import { devEmailLogger } from "./email-adapter";
import {
  AuthError,
  UnauthenticatedError,
  ForbiddenError,
  RateLimitError,
} from "../errors/auth-errors";

describe("MRERR Phase 5 Auth & Permissions Tests", () => {
  describe("Custom Error Model (Section 30)", () => {
    it("should carry stable machine-readable codes", () => {
      const err = new AuthError("Custom Error", "CUSTOM_CODE");
      expect(err.message).toBe("Custom Error");
      expect(err.code).toBe("CUSTOM_CODE");
    });

    it("should initialize correct specific subclasses", () => {
      const unauth = new UnauthenticatedError();
      expect(unauth.code).toBe("UNAUTHENTICATED");
      expect(unauth.message).toBe("Authentication required");

      const forbidden = new ForbiddenError();
      expect(forbidden.code).toBe("FORBIDDEN");

      const rateLimit = new RateLimitError();
      expect(rateLimit.code).toBe("RATE_LIMIT");
    });
  });

  describe("Permissions Engine (Section 18, 19)", () => {
    it("should permit administrators full platform permissions", () => {
      // Admin should be able to perform project create, update, delete, publish
      expect(checkPermission("admin", "project", "create")).toBe(true);
      expect(checkPermission("admin", "project", "publish")).toBe(true);
      expect(checkPermission("admin", "settings", "update")).toBe(true);
    });

    it("should deny normal users write/delete permissions on critical models", () => {
      // Regular user should not be able to create, update, or delete projects
      expect(checkPermission("user", "project", "create")).toBe(false);
      expect(checkPermission("user", "project", "delete")).toBe(false);
      expect(checkPermission("user", "settings", "update")).toBe(false);
    });

    it("should permit normal users read-only permissions on public models", () => {
      expect(checkPermission("user", "project", "read")).toBe(true);
      expect(checkPermission("user", "article", "read")).toBe(true);
    });

    it("should reject completely invalid roles and resource inputs", () => {
      expect(checkPermission("invalid-role", "project", "read")).toBe(false);
      // @ts-ignore
      expect(checkPermission("user", "invalid-resource", "read")).toBe(false);
    });
  });

  describe("Development Email Delivery (Section 6, 7, 8)", () => {
    it("should log email details cleanly and safely without logging passwords/secrets", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const payload = {
        to: "developer@example.com",
        subject: "Verification",
        text: "Please verify by clicking http://localhost/verify",
        html: "<p>Verification</p>",
      };

      await devEmailLogger(payload);

      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls.flatMap((c) => c[0]);
      expect(calls.some((c) => c.includes("To: developer@example.com"))).toBe(true);
      expect(calls.some((c) => c.includes("Body:"))).toBe(true);

      // Ensure no secrets/passwords are printed
      expect(calls.some((c) => c.includes("BETTER_AUTH_SECRET"))).toBe(false);

      consoleSpy.mockRestore();
    });
  });
});
