# Architecture

## Core Philosophy

> Prioritize simplicity over cleverness. Every abstraction must have a clear purpose.

## Monorepo

We use Turborepo for orchestrating builds, linting, typechecking, and testing. It ensures that we only rebuild packages that have changed, drastically improving CI/CD and local development performance.

## Design vs UI

We explicitly separate `@mrerr/design` (Tailwind CSS v4 CSS-first tokens) from `@mrerr/ui` (React components). This allows design tokens to be reused without pulling in React dependencies.

## React Router v7

Applications use the React Router v7 Framework mode, providing built-in server rendering, data loading, and routing conventions. Each app extends a shared Vite configuration.

## Environment Variables

Environment variables are strictly typed using Zod in `@mrerr/env`. We never use `process.env` directly in application code to ensure fail-fast behavior.
