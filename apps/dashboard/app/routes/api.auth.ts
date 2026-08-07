import { auth } from "@mrerr/auth";

// React Router v7 pass-through handler for Better Auth API requests (Section 13, 14 & Decision #5)
export async function loader({ request }: { request: Request }) {
  return auth.handler(request);
}

export async function action({ request }: { request: Request }) {
  return auth.handler(request);
}
