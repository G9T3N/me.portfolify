# Migration Guide

We use Drizzle Kit to manage our PostgreSQL schema migrations.

## Workflow

1. Update the schema definitions in `packages/database/src/schema/*.ts`.
2. Generate a new migration file:
   ```bash
   pnpm --filter @mrerr/database generate
   ```
   This will output a new `.sql` file in `packages/database/src/migrations/`.
3. Apply migrations to your local development database:
   ```bash
   pnpm --filter @mrerr/database migrate
   ```

*Note: Migrations should always be applied before running the application or tests.*
