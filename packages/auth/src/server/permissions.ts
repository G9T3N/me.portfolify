import { createAccessControl } from "better-auth/plugins/access";
import { type } from "arktype";

// Strongly-typed ArkType schemas for runtime roles & permissions checking
export const roleSchema = type("'admin' | 'user'");

export const permissionActionSchema = type({
  resource:
    "'project' | 'article' | 'experience' | 'skill' | 'media' | 'seo' | 'navigation' | 'settings' | 'analytics' | 'user'",
  action: "string > 0",
});

// Centralized platform permission vocabulary (Section 18)
export const statement = {
  project: ["read", "create", "update", "delete", "publish"],
  article: ["read", "create", "update", "delete", "publish"],
  experience: ["read", "create", "update", "delete"],
  skill: ["read", "create", "update", "delete"],
  media: ["read", "upload", "update", "delete"],
  seo: ["read", "update"],
  navigation: ["read", "update"],
  settings: ["read", "update"],
  analytics: ["read"],
  user: ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

// Base user role - read-only for public resources, own settings read/update
export const userRole = ac.newRole({
  project: ["read"],
  article: ["read"],
  experience: ["read"],
  skill: ["read"],
  media: ["read"],
  seo: ["read"],
  navigation: ["read"],
  settings: ["read"],
  user: ["read", "update"],
});

// Administrative role - full system access
export const adminRole = ac.newRole({
  project: ["read", "create", "update", "delete", "publish"],
  article: ["read", "create", "update", "delete", "publish"],
  experience: ["read", "create", "update", "delete"],
  skill: ["read", "create", "update", "delete"],
  media: ["read", "upload", "update", "delete"],
  seo: ["read", "update"],
  navigation: ["read", "update"],
  settings: ["read", "update"],
  analytics: ["read"],
  user: ["read", "update"],
});

export const roles = {
  admin: adminRole,
  user: userRole,
};

// Strongly-typed check utilizing our access controller
export function checkPermission(
  role: string,
  resource: keyof typeof statement,
  action: string,
): boolean {
  const verifiedRole = roleSchema(role);
  if (verifiedRole instanceof Error) return false;

  const roleObj = roles[verifiedRole as keyof typeof roles];
  if (!roleObj) return false;

  // Better Auth Access Control authorize() API (Section 19 & Decision #2)
  const result = roleObj.authorize({
    [resource]: [action],
  } as any);

  return result.success;
}
