import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isAdminEmail, sendAuthEmail } from "./email";

const DAY = 60 * 60 * 24;

function createAuth() {
  if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : undefined,
    session: {
      expiresIn: 30 * DAY,
      updateAge: DAY,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    rateLimit: {
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({ to: user.email, subject: "Reset your XBK password", heading: "Reset your password", cta: "Reset password", url });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({ to: user.email, subject: "Verify your XBK email", heading: "Verify your email", cta: "Verify email", url });
      },
      // Admin is only granted to a verified address (see databaseHooks below).
      afterEmailVerification: async (user) => {
        if (isAdminEmail(user.email)) {
          await getDb().update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, user.id));
        }
      },
    },
    socialProviders:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {},
    user: {
      deleteUser: { enabled: true },
      additionalFields: {
        role: { type: "string", defaultValue: "customer", input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Unverified email/password sign-ups never get admin; they're promoted after verifying.
          before: async (user) => ({
            data: {
              ...user,
              role: user.emailVerified && isAdminEmail(user.email) ? "admin" : "customer",
            },
          }),
        },
      },
    },
    plugins: [nextCookies()], // keep last
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/** Lazy so importing this module never requires a database connection. */
export function getAuth() {
  return (instance ??= createAuth());
}
