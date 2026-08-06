# Repository Guide

The Repository Pattern acts as the gateway between the database and the domain.

## Rules

1. **Never return raw Drizzle types.** Always return ArkType-validated Domain models (e.g., `Project.Project`).
2. **Handle errors explicitly.** Use the custom errors from `errors.ts` like `NotFoundError`, `DuplicateError`, or `ValidationFailureError`.
3. **Validate at the boundary.** Data entering and leaving the repository must pass ArkType schema validation (`projectSchema(data)`).
4. **No UI or Business Logic.** Repositories only coordinate persistence. Validation rules stay in ArkType, UI state stays in React.

## Usage Example

```typescript
import { repositories } from "@mrerr/database";

const projectRepo = new repositories.ProjectRepository();

// Get valid Domain objects
const projects = await projectRepo.find();

// Creating
const newProject = await projectRepo.create({
  title: "New Proj",
  // ... other fields
});
```
