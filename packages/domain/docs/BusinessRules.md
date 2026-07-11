# Business Rules

While this layer primarily sets up schemas, certain invariant business rules dictate platform behavior:

- **Slugs:** Must be unique within their respective contexts (Projects, Articles).
- **Featured Items:** If a Project is marked as featured, business logic later should ensure it is also in a 'published' state.
- **Dates:** Experience 'end' dates cannot logically precede 'start' dates. Null 'end' indicates the role is ongoing.
- **Uniqueness:** Navigation order should be unique to avoid display conflicts.
- **SEO Limitations:** SEO title is recommended to be under 60 characters and description under 160 characters.
