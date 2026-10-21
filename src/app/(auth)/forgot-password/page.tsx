import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return (
    <Suspense>
      <PasswordResetForm mode="request" />
    </Suspense>
  );
}
