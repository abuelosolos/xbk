import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Join Us" };

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
