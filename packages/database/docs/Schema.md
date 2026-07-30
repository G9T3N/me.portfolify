# Database Schema

The database relies heavily on the `BaseEntity` from the Domain Layer:

- `id` (UUID, primary key)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

And for `PublishableEntity`:

- `isPublished` (boolean)
- `publishedAt` (Timestamp, nullable)

## Core Tables

- `projects`: Main entity for portfolio pieces.
- `articles`: Main entity for blog posts.
- `experience`: Work history entries.
- `skills`: Grouped skills (e.g., Languages, Tools).
- `profile`: A singleton-like table for the owner's details.
- `media`: Centralized media assets mapping.
- `navigation`: Main menu items.
- `seo`: Global and fallback SEO defaults.
- `settings`: Application configuration.

_Join tables and value objects map strictly to Domain representations._
