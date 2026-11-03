import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { Pool } from "pg";
import { passwordSchema } from "../utils/validation";
import { sendEmail } from "../email/email";
import {
  getVerificationEmailHtml,
  getResetPasswordEmailHtml,
  getPasswordChangedEmailHtml,
} from "../email/email-templates";
import { deleteUserData } from "../db/supabase";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const auth = betterAuth({
  database: pool,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Resetowanie hasła - Big Plan",
        html: getResetPasswordEmailHtml({ url, userName: user.name }),
      });
    },
    async onPasswordReset({ user }) {
      await sendEmail({
        to: user.email,
        subject: "Hasło zostało zmienione - Big Plan",
        html: getPasswordChangedEmailHtml({ userName: user.name }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Potwierdź swój adres e-mail - Big Plan",
        html: getVerificationEmailHtml({ url, userName: user.name }),
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await deleteUserData(user.id);
      },
    },
    additionalFields: {
      role: { type: "string", input: false },
      subscriptionPlan: { type: "string", input: false },
      wants_newsletter: {
        type: "boolean",
        input: true,
        defaultValue: false,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const parsed = passwordSchema.safeParse(password);
        if (!parsed.success) {
          const messages = parsed.error.issues
            .map((i) => i.message)
            .filter(Boolean)
            .join(", ");
          throw new APIError("BAD_REQUEST", {
            message: messages || "Nieprawidłowe hasło",
          });
        }
      }
    }),
  },
  trustedOrigins: [
    "https://bigplan.pl",
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
  ].filter(Boolean) as string[],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
