import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@/db";

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "customer", input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              role: adminEmails().includes(user.email.toLowerCase()) ? "admin" : "customer",
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
