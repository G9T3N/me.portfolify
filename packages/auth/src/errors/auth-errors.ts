export class AuthError extends Error {
  public readonly code: string;
  constructor(message: string, code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export class UnauthenticatedError extends AuthError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHENTICATED");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "Access denied") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid email or password") {
    super(message, "INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message = "Session has expired") {
    super(message, "SESSION_EXPIRED");
    this.name = "SessionExpiredError";
  }
}

export class InvalidSessionError extends AuthError {
  constructor(message = "Session is invalid") {
    super(message, "INVALID_SESSION");
    this.name = "InvalidSessionError";
  }
}

export class RateLimitError extends AuthError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}
