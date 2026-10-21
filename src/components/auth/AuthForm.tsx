"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { GoogleIcon } from "@/components/brand/ProviderIcons";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Envelope, Lock, User } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { useFieldErrors } from "@/lib/use-field-errors";
import { safeNext } from "@/lib/utils";
import { email as emailRule, fullName, newPassword } from "@/lib/validation";

const signUpSchema = z.object({ name: fullName, email: emailRule, password: newPassword });
const signInSchema = z.object({ email: emailRule, password: z.string().min(1, "Enter your password.") });

const OAUTH_ERRORS: Record<string, string> = {
  access_denied: "Google sign-in was cancelled.",
  "account_not_linked": "An account with this email already exists. Sign in with your password, then connect Google under Linked Accounts.",
  "email_not_found": "Google didn't share an email address, so we couldn't sign you in.",
  "unable_to_link_account": "We couldn't link Google to your account. Sign in with your password instead.",
};
const oauthMessage = (code: string | null) => (code ? (OAUTH_ERRORS[code] ?? "Google sign-in didn't work. Please try again.") : null);

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/account");
  const [error, setError] = useState<string | null>(oauthMessage(params.get("error")));
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
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: `/${mode}?next=${encodeURIComponent(next)}`,
    });
    if (error) {
      setError(error.message ?? "Google sign-in is unavailable.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      below={
        <>
          <p className="text-fs-14 text-mute">
            {signUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link href={signUp ? `/sign-in?next=${encodeURIComponent(next)}` : `/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-ink hover:text-charcoal">
              {signUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </>
      }
    >
      <AuthHeader
        hideTitle
        title={signUp ? "Sign up to continue" : "Sign in to continue"}
        subtitle={signUp ? "Sign up to track orders." : "Sign in to make and track orders."}
      />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {signUp && <Field filled icon={<User size={18} />} label="Full name" {...v.props("name")} name="name" placeholder="Full name" autoComplete="name" />}
        <Field filled icon={<Envelope size={18} />} label="Email" {...v.props("email")} name="email" type="email" placeholder="Email" autoComplete="email" />
        <Field
          filled
          icon={<Lock size={18} />}
          label="Password"
          {...v.props("password")}
          name="password"
          type="password"
          placeholder={signUp ? "Password (8+ characters)" : "Password"}
          autoComplete={signUp ? "new-password" : "current-password"}
        />
        {!signUp && (
          <Link href="/forgot-password" className="block text-fs-14 text-mute hover:text-ink">
            Forgot password?
          </Link>
        )}
        {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
        <p className="pt-2 text-center text-fs-12 text-mute">
          {signUp ? "By signing up, you agree to our Terms of Service." : "By signing in, you agree to our Terms of Service."}
        </p>
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
    </AuthShell>
  );
}
