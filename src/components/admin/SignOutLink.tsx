"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/** Text-style sign-out used in the admin sidebar and More sheet. */
export function SignOutLink({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
