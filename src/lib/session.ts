import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

export async function getSession() {
  const requestHeaders = await headers(); // read first so callers opt into dynamic rendering
  return getAuth().api.getSession({ headers: requestHeaders });
}

export async function requireUser(next = "/") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}

/** Server-side admin gate. Middleware only checks for a cookie; this checks the role. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/admin");
  if ((session.user as { role?: string }).role !== "admin") redirect("/");
  return session;
}
