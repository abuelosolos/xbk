import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/session";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // The middleware only sees the cookie; a stale one must still reach the form.
  const session = await getSession().catch(() => null);
  if (session) redirect(safeNext((await searchParams).next, "/account"));

  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
