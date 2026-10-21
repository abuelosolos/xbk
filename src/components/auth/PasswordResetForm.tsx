"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Envelope, Lock } from "@phosphor-icons/react";
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
    <AuthShell below={<Link href="/sign-in" className="text-fs-14 font-medium text-ink hover:text-charcoal">Back to sign in</Link>}>
      <AuthHeader
        title={reset ? "Choose a New Password" : "Forgot Password"}
        subtitle={reset ? "Enter a new password for your account." : "Enter your email and we'll send you a reset link."}
      />
      {sent ? (
        <p role="status" className="text-fs-16">If an account exists for that email, a reset link is on its way.</p>
      ) : reset && !token ? (
        <p role="alert" className="text-fs-14 font-medium text-sale">This reset link is invalid or has expired.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {reset ? (
            <Field filled icon={<Lock size={18} />} label="New password" {...v.props("password")} name="password" type="password" placeholder="Password (8+ characters)" autoComplete="new-password" />
          ) : (
            <Field filled icon={<Envelope size={18} />} label="Email" {...v.props("email")} name="email" type="email" placeholder="Email" autoComplete="email" />
          )}
          {error && <p role="alert" className="text-fs-14 font-medium text-sale">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Please wait…" : reset ? "Update Password" : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
