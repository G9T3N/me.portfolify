# MRERR Auth — Package Architecture

The `@mrerr/auth` package is a foundational platform module designed to centralize and encapsulate all security, authentication, session management, and authorization services.

## Package Dependencies & Architecture Flow
The platform enforces a unidirectional dependency hierarchy:
```text
apps/dashboard (Dashboard UI, loaders, actions)
      ↓
@mrerr/auth (Better Auth server & client config, route protection, session helpers)
      ↓
@mrerr/database (PostgreSQL schemas, transactions, Drizzle adapter)
      ↓
PostgreSQL
```
The Business Domain package (`@mrerr/domain`) maintains complete isolation and contains zero dependencies on database engines, React, or auth packages.

## Source Folder Structure

```text
packages/auth/
    src/
        server/
            auth.ts         # Better Auth Server initialization and email stubs
            permissions.ts  # RBAC permission registries & ArkType role schemas
            session.ts      # Server-side context resolvers and enforcers
            security.ts     # Cookie and rate-limiting security variables
        client/
            auth-client.ts  # Scoped, typed client-side SDK for dashboard views
        middleware/
            require-auth.ts # Route-level loader and action adapters
        errors/
            auth-errors.ts  # Unified auth exceptions with stable error codes
        index.ts            # Central package exports
```

## Public Package Exports
The package utilizes standard package exports to isolate internal configurations from callers (configured in `package.json`):
* `import { protectLoader, getSession } from "@mrerr/auth"`: For server-side loaders/actions.
* `import { authClient, signIn } from "@mrerr/auth/client"`: For client-side React code.
