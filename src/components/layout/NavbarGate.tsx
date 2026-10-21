"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { hidesSiteChrome } from "@/lib/chrome";

/** Sign-in and sign-up are standalone pages: no navbar. */
export function NavbarGate() {
  if (hidesSiteChrome(usePathname())) return null;
  return <Navbar />;
}
