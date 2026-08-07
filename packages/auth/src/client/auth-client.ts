import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

// Setup and export typed client API (Section 15 & 17)
export const authClient = createAuthClient({
  // Fallback to empty string for same-origin or let Better Auth resolve it
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "user",
        },
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

export const signIn = {
  email: authClient.signIn.email,
};

export const signUp = {
  email: authClient.signUp.email,
};

export const signOut = authClient.signOut;

export const useSession = authClient.useSession;
export const getSession = authClient.getSession;
