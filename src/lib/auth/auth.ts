import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { Pool } from "pg";
import { passwordSchema } from "../utils/validation";
import { sendEmail } from "../email/email";

// Pool do tabel auth (user/session/account/verification)
// Na Netlify/serverless lepiej DATABASE_URL (pooler 6543)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
  // opcjonalnie przy poolerze Supabase:
  // ssl: { rejectUnauthorized: false },
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
        subject: "Reset your password",
        html: `<p>Please reset your password by clicking the link below:</p>
               <a href="${url}">${url}</a>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `<p>Please verify your email by clicking the link below:</p>
               <a href="${url}">${url}</a>`,
      });
    },
  },
  user: {
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
            message: messages || "Invalid input",
          });
        }
      }
    }),
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
