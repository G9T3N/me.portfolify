import { redirect } from "react-router";
import { getSession } from "../server/session";
import { UnauthenticatedError, ForbiddenError } from "../errors/auth-errors";
import { statement } from "../server/permissions";

// Reusable loader-protection adapter that handles redirects and query state (Section 22)
export async function protectLoader(request: Request, redirectTo = "/login") {
  const session = await getSession(request);
  if (!session || !session.user) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams({ callbackUrl: url.pathname + url.search });
    throw redirect(`${redirectTo}?${searchParams.toString()}`);
  }
  return session;
}

// Admin-only loader-protection adapter (Section 22)
export async function protectAdminLoader(request: Request, redirectTo = "/login") {
  const session = await protectLoader(request, redirectTo);
  if (session.user.role !== "admin") {
    throw redirect("/forbidden");
  }
  return session;
}

// Action-protection adapter for server-side endpoints (Section 21)
export async function protectAction(request: Request) {
  const session = await getSession(request);
  if (!session || !session.user) {
    throw new UnauthenticatedError();
  }
  return session;
}

// Action-protection with specific permission checking (Section 21, 22)
export async function protectActionWithPermission(
  request: Request,
  resource: keyof typeof statement,
  action: string,
) {
  const session = await protectAction(request);
  if (session.user.role !== "admin") {
    throw new ForbiddenError(`Action rejected: missing permission '${resource}.${action}'.`);
  }
  return session;
}
