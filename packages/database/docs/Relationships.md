# Relationships Strategy

Our schema normalization strategy distinguishes between entities with an independent lifecycle and simple value objects.

## Normalized (Standalone Tables & Joins)
- **Projects <-> Technologies**: Many-to-many (`project_technologies`).
- **Articles <-> Tags**: Many-to-many (`article_tags`).
- **Projects <-> Media**: Many-to-many (`project_media`).
- **Experience <-> Skills**: Many-to-many (`experience_skills`).
- **Profile -> Social Links**: One-to-many (Social links have `profileId`).

## Value Objects (Embedded Arrays)
- **Experience Highlights**: Stored as `text[]` in `experience.highlights`. They have no meaning outside a specific experience.
- **Project Images**: Stored as `text[]` in `projects.images` (URLs) where full Media asset tracking isn't required.

This avoids over-normalizing simple lists while maintaining referential integrity for complex graphs.
