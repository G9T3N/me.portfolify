# MRERR Auth — Role-Based Access Control (RBAC)

Authorization answers: "What are you allowed to do?" on the MRERR Platform.

## Unified Role Model
Initially, the platform supports exactly two system-level roles:
1. `admin`: Has full write, delete, create, and read permissions on all public and secure resources.
2. `user`: Has read-only permissions on public resources, and update permissions on their own user settings.

## Platform Permission Vocabulary
Permissions are centrally registered inside `@mrerr/auth` in `src/server/permissions.ts`. Unchecked string queries are prohibited.
* `project`: `read`, `create`, `update`, `delete`, `publish`
* `article`: `read`, `create`, `update`, `delete`, `publish`
* `experience`, `skill`: `read`, `create`, `update`, `delete`
* `media`: `read`, `upload`, `update`, `delete`
* `seo`, `navigation`, `settings`: `read`, `update`
* `analytics`: `read`
* `user`: `read`, `update`

## Server-side Enforcement
Client-side checks are strictly used to configure UX layout features (e.g. hiding an admin tab). Server-side enforcers (`requirePermission`, `requireRole`, and action wrappers) must wrap all protected routes and mutations to prevent API-level compromises.
