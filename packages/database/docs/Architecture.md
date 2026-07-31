# Database Architecture

## Principles

1. **Domain Over Database:** The Domain Layer (`@mrerr/domain`) is the ultimate source of truth. The database schema perfectly mirrors the domain schema.
2. **Encapsulation:** The rest of the platform interacts only with Repositories and Queries. It has no knowledge of Drizzle or PostgreSQL-specific implementations.
3. **Runtime Validation:** Repositories use ArkType schemas to validate objects being saved to or retrieved from the database, protecting against corrupted data or mismatched shapes.
4. **Normalized Relationships:** Meaningful relations (e.g., Projects <-> Technologies) are fully normalized using Drizzle relations and join tables. Simple value objects (like `Experience.highlights`) use `text[]` columns to avoid unnecessary complexity.

## Building Blocks

- **Connection**: Managed in `packages/database/src/connection/client.ts`. Uses `postgres.js` with `drizzle-orm` configured to reuse connections properly based on `NODE_ENV`.
- **Schemas**: Housed in `packages/database/src/schema/*.ts`. Use explicit UUID fields mirroring the `BaseEntity` Domain pattern.
- **Repositories**: Standardized CRUD using interfaces in `packages/database/src/repositories/base.ts`. Converts to/from Domain types explicitly.
- **Queries**: Reusable specific SQL compositions (like `getProjectWithTechnologies`) live in `packages/database/src/queries/`.
- **Migrations**: Generated into `packages/database/src/migrations/`.
