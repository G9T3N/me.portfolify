import { auth } from "./auth";
import { UnauthenticatedError, ForbiddenError } from "../errors/auth-errors";
import { checkPermission, statement } from "./permissions";

// Resolves a Request or Headers object to retrieve the current session (Section 10, 13)
export async function getSession(headersOrRequest: Request | Headers) {
  const headers = headersOrRequest instanceof Request ? headersOrRequest.headers : headersOrRequest;
  try {
    const session = await auth.api.getSession({ headers });
    return session;
  } catch (err) {
    return null;
  }
}

// Retrieves the session or throws an UnauthenticatedError if no active session is found (Section 10, 20, 22)
export async function requireSession(headersOrRequest: Request | Headers) {
  const session = await getSession(headersOrRequest);
  if (!session || !session.user) {
    throw new UnauthenticatedError();
  }
  return session;
}

// Retrieves the current authenticated user safely
export async function getCurrentUser(headersOrRequest: Request | Headers) {
  const session = await getSession(headersOrRequest);
  return session?.user || null;
}

// Retrieves the current authenticated user or throws UnauthenticatedError
export async function requireUser(headersOrRequest: Request | Headers) {
  const session = await requireSession(headersOrRequest);
  return session.user;
}

// Enforces server-side authorization by verifying roles (Section 20, 21, 22)
export async function requireRole(
  headersOrRequest: Request | Headers,
  allowedRoles: ("admin" | "user")[],
) {
  const user = await requireUser(headersOrRequest);

  // Explicitly check role field on the user model
  const userRole = user.role as any;
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(`Access denied: required role in [${allowedRoles.join(", ")}].`);
  }
  return user;
}

// Enforces server-side authorization by verifying specific resource/action permissions (Section 20, 21, 22)
export async function requirePermission(
  headersOrRequest: Request | Headers,
  resource: keyof typeof statement,
  action: string,
) {
  const user = await requireUser(headersOrRequest);
  const userRole = user.role || "user";

  const isAllowed = checkPermission(userRole, resource, action);
  if (!isAllowed) {
    throw new ForbiddenError(`Access denied: missing permission '${resource}.${action}'.`);
  }
  return user;
}
