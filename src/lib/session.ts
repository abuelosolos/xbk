import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

export type Role = "customer" | "admin";

/** Cached per request so layout, page and action share one lookup. */
export const getSession = cache(async () => {
  const requestHeaders = await headers(); // read first so callers opt into dynamic rendering
  return getAuth().api.getSession({ headers: requestHeaders });
});

export const isAdmin = (session: { user: object } | null) => (session?.user as { role?: Role } | undefined)?.role === "admin";

export async function requireUser(next = "/") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}

/** Server-side admin gate. Middleware only checks for a cookie; this checks the role. */
export async function requireAdmin(next = "/admin") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!isAdmin(session)) redirect("/");
  return session;
}
