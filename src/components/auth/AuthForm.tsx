"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { GoogleIcon } from "@/components/brand/ProviderIcons";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";
import { useFieldErrors } from "@/lib/use-field-errors";
import { safeNext } from "@/lib/utils";
import { email as emailRule, fullName, newPassword } from "@/lib/validation";

const signUpSchema = z.object({ name: fullName, email: emailRule, password: newPassword });
const signInSchema = z.object({ email: emailRule, password: z.string().min(1, "Enter your password.") });

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"), "/account");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signUp = mode === "sign-up";
  const v = useFieldErrors(signUp ? signUpSchema : signInSchema);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    if (!v.checkAll({ name: String(f.get("name") ?? ""), email, password })) return;
    setLoading(true);

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

  async function onGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: next });
    if (error) {
      setError(error.message ?? "Google sign-in is unavailable.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-16">
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">{signUp ? "Join XBK" : "Sign In"}</h1>
      <p className="mb-8 text-fs-16 text-mute">{signUp ? "Create an account to check out and track orders." : "Welcome back."}</p>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {signUp && <Field label="Full name" {...v.props("name")} name="name" placeholder="Full name" autoComplete="name" />}
        <Field label="Email" {...v.props("email")} name="email" type="email" placeholder="Email" autoComplete="email" />
        <Field
          label="Password"
          {...v.props("password")}
          name="password"
          type="password"
          placeholder={signUp ? "Password (8+ characters)" : "Password"}
          autoComplete={signUp ? "new-password" : "current-password"}
        />
        {!signUp && (
          <Link href="/forgot-password" className="block text-fs-14 text-mute underline underline-offset-4">
            Forgot password?
          </Link>
        )}
        {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Please wait…" : signUp ? "Create Account" : "Sign In"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-4 text-fs-14 text-mute">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <Button type="button" variant="outline" size="lg" disabled={loading} onClick={onGoogle} className="w-full">
        <GoogleIcon />
        Continue with Google
      </Button>
      <p className="mt-6 text-fs-14 text-mute">
        {signUp ? "Already a member?" : "New to XBK?"}{" "}
        <Link href={signUp ? `/sign-in?next=${encodeURIComponent(next)}` : `/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-ink underline underline-offset-4">
          {signUp ? "Sign in" : "Join us"}
        </Link>
      </p>
    </div>
  );
}
