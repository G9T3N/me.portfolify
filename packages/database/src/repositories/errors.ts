export class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier '${identifier}' not found`);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends RepositoryError {
  constructor(entityName: string, field: string, value?: string, cause?: unknown) {
    super(`${entityName} with ${field} '${value || 'unknown'}' already exists`, cause);
    this.name = "DuplicateError";
  }
}

export class ValidationFailureError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(`Validation failed: ${message}`, cause);
    this.name = "ValidationFailureError";
  }
}

export class ConflictError extends RepositoryError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export function handlePostgresError(err: unknown, entityName: string): never {
  if (typeof err === "object" && err !== null && "code" in err) {
    const pgErr = err as { code: string; detail?: string; constraint?: string };

    // 23505 is unique_violation
    if (pgErr.code === "23505") {
      throw new DuplicateError(entityName, pgErr.constraint || "unknown", undefined, err);
    }

    // 23503 is foreign_key_violation
    if (pgErr.code === "23503") {
      throw new ConflictError(`Foreign key violation on ${entityName}: ${pgErr.detail}`);
    }
  }

  throw new RepositoryError(`Unexpected database error in ${entityName}`, err);
}
