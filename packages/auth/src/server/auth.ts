import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@mrerr/database";
import * as schema from "@mrerr/database/src/schema";
import { admin as adminPlugin } from "better-auth/plugins";
import { serverEnv } from "@mrerr/env";
import { ac, roles } from "./permissions";
import { securityConfig } from "./security";
import { getEmailSender } from "./email-adapter";

// Core Better Auth Server Instance (Section 10, 11)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  secret: serverEnv.BETTER_AUTH_SECRET || "development-high-entropy-secure-secret-placeholder",
  baseURL: serverEnv.BETTER_AUTH_URL || "http://localhost:3000",

  // Pluggable cookie/session security configurations (Section 11, 40)
  session: securityConfig.session,
  cookie: securityConfig.cookie,
  rateLimit: securityConfig.rateLimit,

  // Pluggable Authentication Methods (Section 8)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) {
      const sender = getEmailSender();
      await sender({
        to: user.email,
        subject: "Verify your email address - MRERR Platform",
        text: `Hello ${user.name},\n\nPlease verify your email address by clicking this link:\n${url}`,
        html: `<p>Hello ${user.name},</p><p>Please verify your email address by clicking <a href="${url}">here</a>.</p>`,
      });
    },
    async sendResetPassword({ user, url }: { user: { email: string; name: string }; url: string }) {
      const sender = getEmailSender();
      await sender({
        to: user.email,
        subject: "Reset your password - MRERR Platform",
        text: `Hello ${user.name},\n\nYou requested a password reset. Click this link to reset it:\n${url}`,
        html: `<p>Hello ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password.</p>`,
      });
    },
  },

  // Pluggable native roles & access-control plugins (Section 17, 18, 19 & Decision #2)
  plugins: [
    adminPlugin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
