# MRERR Platform

The scalable, maintainable monorepo that powers `mrerr.com`, `me.mrerr.com`, and `dashboard.mrerr.com`.

## 🏗 Architecture

This project uses a monorepo structure managed by [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io).

### Applications

- `apps/portfolio` - The main portfolio website (`mrerr.com`)
- `apps/me` - The personal bio link site (`me.mrerr.com`)
- `apps/dashboard` - The personal management dashboard (`dashboard.mrerr.com`)

All applications are built with React Router v7 Framework Mode.

### Foundational Packages

- `@mrerr/ui` - React components using Radix UI
- `@mrerr/design` - Tailwind CSS v4 design tokens and styles
- `@mrerr/database` - Drizzle ORM and PostgreSQL connection
- `@mrerr/auth` - Better Auth implementation
- `@mrerr/env` - Zod environment validation
- `@mrerr/validation` - Zod shared schemas
- `@mrerr/seo` - Reusable SEO utilities
- `@mrerr/config` - Shared static configurations

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start the PostgreSQL database
docker-compose up -d

# Start the development servers
pnpm dev
```
