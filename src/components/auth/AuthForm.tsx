"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { safeNext } from "@/lib/utils";

const field =
  "h-12 w-full rounded-field border border-hairline bg-white px-4 text-[16px] outline-none transition focus:border-ink focus:ring-2 focus:ring-ink";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), "/account");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));

    const { error } = signUp
      ? await authClient.signUp.email({ name: String(f.get("name")), email, password })
      : await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-16">
      <h1 className="mb-2 text-[32px] font-medium leading-tight">{signUp ? "Join XBK" : "Sign In"}</h1>
      <p className="mb-8 text-[16px] text-mute">{signUp ? "Create an account to check out and track orders." : "Welcome back."}</p>
      <form onSubmit={onSubmit} className="space-y-4">
        {signUp && <input name="name" required placeholder="Full name" autoComplete="name" className={field} />}
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} />
        <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" autoComplete={signUp ? "new-password" : "current-password"} className={field} />
        {error && <p role="alert" className="text-[14px] font-medium text-sale">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Please wait…" : signUp ? "Create Account" : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-[14px] text-mute">
        {signUp ? "Already a member?" : "New to XBK?"}{" "}
        <Link href={signUp ? `/sign-in?next=${encodeURIComponent(next)}` : `/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-ink underline underline-offset-4">
          {signUp ? "Sign in" : "Join us"}
        </Link>
      </p>
    </div>
  );
}
