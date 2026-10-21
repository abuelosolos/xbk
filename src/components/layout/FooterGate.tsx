"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

/** Checkout stays distraction-free: no footer or newsletter there. */
export function FooterGate() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return null;
  return <Footer />;
}
