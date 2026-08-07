export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
  }
}

export class NotFoundError extends RepositoryError {
  constructor(
    public readonly entityName: string,
    public readonly identifier: string,
  ) {
    super(`${entityName} with identifier '${identifier}' not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends RepositoryError {
  constructor(entityName: string, field: string, value?: string, cause?: unknown) {
    super(`${entityName} with ${field} '${value || "unknown"}' already exists`, cause);
    this.name = "DuplicateError";
  }
}

export interface ValidationIssue {
  path: string[];
  message: string;
}

export class ValidationFailureError extends RepositoryError {
  public readonly boundary: "domain-to-database" | "database-to-domain";
  public readonly entity: string;
  public readonly operation?: string;
  public readonly issues: readonly ValidationIssue[];

  constructor(context: {
    boundary: "domain-to-database" | "database-to-domain";
    entity: string;
    operation?: string;
    issues: readonly ValidationIssue[];
    cause?: unknown;
  }) {
    super(
      `${context.entity} failed runtime validation at the ${context.boundary} boundary.`,
      "VALIDATION_FAILURE",
      context.cause,
    );
    this.name = "ValidationFailureError";
    this.boundary = context.boundary;
    this.entity = context.entity;
    this.operation = context.operation;
    this.issues = context.issues;
  }
}

export class ConflictError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, "CONFLICT", cause);
    this.name = "ConflictError";
  }
}

export class RelationshipReferenceError extends RepositoryError {
  public readonly entity: string;
  public readonly relationship: string;
  public readonly missing: string[];

  constructor(context: {
    entity: string;
    relationship: string;
    missing: string[];
    cause?: unknown;
  }) {
    super(
      `${context.entity} references ${context.relationship} that do not exist.`,
      "RELATIONSHIP_REFERENCE_ERROR",
      context.cause,
    );
    this.name = "RelationshipReferenceError";
    this.entity = context.entity;
    this.relationship = context.relationship;
    this.missing = context.missing;
  }
}

export function mapValidationError(
  err: unknown,
  boundary: "domain-to-database" | "database-to-domain",
  entity: string,
  operation?: string,
): ValidationFailureError {
  const issues: ValidationIssue[] = [];
  if (err && typeof err === "object" && "issues" in err && Array.isArray((err as any).issues)) {
    for (const issue of (err as any).issues) {
      issues.push({
        path: issue.path || [],
        message: issue.message || String(issue),
      });
    }
  } else {
    issues.push({
      path: [],
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return new ValidationFailureError({
    boundary,
    entity,
    operation,
    issues,
    cause: err,
  });
}

export function handlePostgresError(err: unknown, entityName: string): never {
  if (typeof err === "object" && err !== null && "code" in err) {
    const pgErr = err as { code: string; detail?: string; constraint?: string };

    // 23505 is unique_violation
    if (pgErr.code === "23505") {
      let field = "unknown";
      if (pgErr.constraint) {
        if (pgErr.constraint.includes("slug")) {
          field = "slug";
        } else if (pgErr.constraint.includes("name")) {
          field = "name";
        } else {
          field = pgErr.constraint;
        }
      }
      throw new DuplicateError(entityName, field, undefined, err);
    }

    // 23503 is foreign_key_violation
    if (pgErr.code === "23503") {
      throw new ConflictError(
        `Foreign key violation on ${entityName}: ${pgErr.detail || "Referenced record missing or still has references"}`,
        err,
      );
    }
  }

  if (err instanceof RepositoryError) {
    throw err;
  }

  throw new RepositoryError(`Unexpected database error in ${entityName}`, "REPOSITORY_ERROR", err);
}
