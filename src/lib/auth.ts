import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { passwordSchema } from "./validation";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
               <a href="${url}">${url}</a>`, // TODO Ulepszyć szablon emaila poprzez REACT EMAIL
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
               <a href="${url}">${url}</a>`, // TODO Ulepszyć szablon emaila poprzez REACT EMAIL
      });
    },
  },
  user: {
    additionalFields: {
      // TODO Dodać dodatkowe pola do usera
      role: {
        type: "string",
        input: false, // ustawione na false, aby pole nie było edytowalne przez użytkownika
      },
      subscriptionPlan: {
        type: "string",
        input: false,
      },
      wants_newsletter: {
        type: "boolean",
        input: true,
        defaultValue: false,
      },
    },
  },
  hooks: {
    // Będzie wywoływane przed każdym zapytaniem better-auth
    before: createAuthMiddleware(async (ctx) => {
      //TODO Dodać ścieżki, które mają spełniać wymaganie hasła
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
  trustedOrigins: ["http://localhost:3001"], // TODO Do zmiany przy produkcji
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
// można użyć tych typów w całej aplikacji do typowania sesji i użytkownika importując je z /lib/auth.ts
