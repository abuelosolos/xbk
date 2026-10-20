"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign Out
    </Button>
  );
}
