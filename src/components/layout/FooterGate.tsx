"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { hidesSiteChrome } from "@/lib/chrome";

/** Checkout, the auth pages and product pages stay distraction-free: no footer or newsletter there. */
export function FooterGate() {
  const pathname = usePathname();
  if (hidesSiteChrome(pathname) || pathname === "/checkout" || pathname.startsWith("/checkout/") || pathname.startsWith("/product/")) return null;
  return <Footer />;
}
