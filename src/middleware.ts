import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/account", "/checkout", "/admin"];

// Better Auth's default cookie name (prefixed with __Secure- on HTTPS).
// Checked directly to keep this edge bundle tiny (better-auth/cookies pulls in jose).
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

const matches = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Optimistic gate: only checks that a session cookie exists (cheap, edge-safe).
 * Real authorization (valid session, admin role) happens server-side in
 * `lib/session.ts` — never rely on this file alone.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (matches(pathname, PROTECTED) && !hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
