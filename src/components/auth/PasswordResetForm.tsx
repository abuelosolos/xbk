"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { authClient } from "@/lib/auth-client";
import { useFieldErrors } from "@/lib/use-field-errors";
import { email as emailRule, newPassword } from "@/lib/validation";

const requestSchema = z.object({ email: emailRule });
const resetSchema = z.object({ password: newPassword });

export function PasswordResetForm({ mode }: { mode: "request" | "reset" }) {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const reset = mode === "reset";
  const v = useFieldErrors(reset ? resetSchema : requestSchema);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (!v.checkAll(reset ? { password } : { email })) return;
    setLoading(true);

    if (reset) {
      const { error } = await authClient.resetPassword({ newPassword: password, token: token ?? "" });
      if (error) {
        setError(error.message ?? "This reset link is invalid or has expired.");
        setLoading(false);
        return;
      }
      router.push("/sign-in");
      return;
    }

    // Same message whether or not the account exists, so emails can't be probed.
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-16">
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">{reset ? "Choose a New Password" : "Forgot Password"}</h1>
      <p className="mb-8 text-fs-16 text-mute">
        {reset ? "Enter a new password for your account." : "Enter your email and we'll send you a reset link."}
      </p>
      {sent ? (
        <p role="status" className="text-fs-16">If an account exists for that email, a reset link is on its way.</p>
      ) : reset && !token ? (
        <p role="alert" className="text-fs-14 font-medium text-sale">This reset link is invalid or has expired.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {reset ? (
            <Field label="New password" {...v.props("password")} name="password" type="password" placeholder="Password (8+ characters)" autoComplete="new-password" />
          ) : (
            <Field label="Email" {...v.props("email")} name="email" type="email" placeholder="Email" autoComplete="email" />
          )}
          {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Please wait…" : reset ? "Update Password" : "Send Reset Link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-fs-14 text-mute">
        <Link href="/sign-in" className="font-medium text-ink underline underline-offset-4">Back to sign in</Link>
      </p>
    </div>
  );
}
