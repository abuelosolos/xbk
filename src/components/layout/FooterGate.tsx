"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { hidesSiteChrome } from "@/lib/chrome";

/** Checkout and the auth pages stay distraction-free: no footer or newsletter there. */
export function FooterGate() {
  const pathname = usePathname();
  if (hidesSiteChrome(pathname) || pathname === "/checkout" || pathname.startsWith("/checkout/")) return null;
  return <Footer />;
}
