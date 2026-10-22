"use client";

import { ChartBar, DotsThree, Package, Receipt, Tag } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { BottomSheet } from "@/components/admin/ui/BottomSheet";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; Icon: ComponentType<{ size?: number; weight?: "fill" | "regular"; "aria-hidden"?: boolean }> }[] = [
  { href: "/admin", label: "Dashboard", Icon: ChartBar },
  { href: "/admin/orders", label: "Orders", Icon: Receipt },
  { href: "/admin/products", label: "Products", Icon: Tag },
  { href: "/admin/inventory", label: "Inventory", Icon: Package },
];

const MORE = [
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/", label: "Back to shop" },
];

/** Phone-only bottom navigation: four main sections plus a More sheet. Hidden from md up (the sidebar takes over). */
export function AdminTabBar() {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const moreActive = MORE.some((m) => m.href !== "/" && isActive(m.href));
  const item = "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-fs-12 font-medium transition";

  return (
    <>
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline-soft bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {TABS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={cn(item, isActive(href) ? "text-ink" : "text-mute")}>
            <Icon size={24} weight={isActive(href) ? "fill" : "regular"} aria-hidden />
            {label}
          </Link>
        ))}
        <button type="button" onClick={() => setMore(true)} aria-haspopup="dialog" className={cn(item, moreActive ? "text-ink" : "text-mute")}>
          <DotsThree size={24} weight={moreActive ? "fill" : "regular"} aria-hidden />
          More
        </button>
      </nav>
      <BottomSheet open={more} onClose={() => setMore(false)} title="More">
        <ul className="divide-y divide-hairline-soft">
          {MORE.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                onClick={() => setMore(false)}
                aria-current={isActive(m.href) && m.href !== "/" ? "page" : undefined}
                className={cn("flex h-14 items-center justify-between text-fs-16", isActive(m.href) && m.href !== "/" ? "font-medium" : "")}
              >
                {m.label}
                <span aria-hidden className="text-mute">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <SignOutLink className="flex h-14 w-full items-center border-t border-hairline-soft text-fs-16" />
      </BottomSheet>
    </>
  );
}
