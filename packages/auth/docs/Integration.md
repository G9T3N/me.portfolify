# MRERR Auth — Application Integration

## React Router v7 Route Handlers
The dashboard application routes authentication requests directly to Better Auth via a pass-through route handler at `apps/dashboard/app/routes/api.auth.ts`:

```typescript
import { auth } from "@mrerr/auth";

export async function loader({ request }) {
  return auth.handler(request);
}

export async function action({ request }) {
  return auth.handler(request);
}
```

## Guarding Dashboard Loaders and Actions
Dashboard layouts or child routes are protected cleanly on the server-side using our middleware adapters:

```typescript
// apps/dashboard/app/routes/home.tsx
import { protectLoader } from "@mrerr/auth";

export async function loader({ request }) {
  // Automatically verifies active session, redirects to /login if empty, preserving redirect url
  const session = await protectLoader(request);
  return { user: session.user };
}
```

Mutations (actions) enforce authorization boundaries similarly:
```typescript
import { protectActionWithPermission } from "@mrerr/auth";

export async function action({ request }) {
  await protectActionWithPermission(request, "project", "create");
  // Proceed with safe, authorized write...
}
```
