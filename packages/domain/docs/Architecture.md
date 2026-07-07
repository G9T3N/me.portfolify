# Domain Layer Architecture

The Domain Layer acts as the single source of truth for the MRERR platform. It encapsulates the core business rules and concepts. All other layers and applications (`apps/*`, persistence layer, API) must depend on the Domain Layer for business vocabulary, validation, and typing.

## Key Principles

- **No Database Details:** The domain model does not define or assume any persistence mechanisms (e.g., ORM schemas or database logic).
- **Framework Agnostic:** No React, API routes, or HTTP logic is present. The domain layer is pure TypeScript and portable.
- **ArkType Validation:** We use ArkType as the canonical source for validation and inferring TypeScript types directly from schemas.

## Structure

- `/src/[module]/`: Each domain concept gets a self-contained module containing its `constants.ts`, `permissions.ts`, `schema.ts`, `types.ts`, and `index.ts`.
- `/src/index.ts`: The unified export point for the `@mrerr/domain` package.
