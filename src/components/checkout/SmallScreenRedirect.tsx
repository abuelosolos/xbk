"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Below lg, sends the customer on to `to`; on desktop the page itself is the receipt. */
export function SmallScreenRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) router.replace(to);
  }, [router, to]);
  return <div className="min-h-[40vh] lg:hidden" aria-hidden />;
}
