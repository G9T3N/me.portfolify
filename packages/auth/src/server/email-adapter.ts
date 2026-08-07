import { serverEnv } from "@mrerr/env";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type EmailSender = (payload: EmailPayload) => Promise<void>;

// Stub / Development email delivery logger (Section 6, 7, 8 & Decision #6)
export const devEmailLogger: EmailSender = async (payload) => {
  if (serverEnv.NODE_ENV === "production") {
    throw new Error("Security Violation: Development email logger must not be run in production.");
  }

  console.log("\n==========================================");
  console.log("[AUTH DEV] EMAIL DELIVERED:");
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body:\n${payload.text}`);
  console.log("==========================================\n");
};

export const getEmailSender = (): EmailSender => {
  if (serverEnv.NODE_ENV === "production") {
    return async () => {
      throw new Error("Production email provider not configured.");
    };
  }
  return devEmailLogger;
};
