"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutLink } from "@/components/admin/SignOutLink";
import { cn } from "@/lib/utils";

const GROUPS = [
  { label: null, links: [{ href: "/admin", label: "Dashboard" }] },
  {
    label: "Catalogue",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/inventory", label: "Inventory" },
      { href: "/admin/categories", label: "Categories" },
    ],
  },
  {
    label: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/shipping", label: "Shipping" },
    ],
  },
  {
    label: "Customers",
    links: [
      { href: "/admin/newsletter", label: "Newsletter" },
      { href: "/admin/emails", label: "Emails" },
    ],
  },
];

/** Grouped sidebar for md+. Phones use AdminTabBar instead. */
export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav aria-label="Admin sidebar" className="flex flex-col gap-6">
      {GROUPS.map((g, i) => (
        <div key={g.label ?? i} className="flex flex-col gap-1">
          {g.label && <p className="px-4 pb-1 text-fs-12 font-medium uppercase tracking-wide text-mute">{g.label}</p>}
          {g.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-pill px-4 text-fs-14 font-medium transition",
                isActive(l.href) ? "bg-ink text-white" : "hover:bg-white",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      ))}
      <div className="flex flex-col gap-1 border-t border-hairline-soft pt-4">
        <Link href="/" className="inline-flex h-9 items-center rounded-pill px-4 text-fs-14 font-medium transition hover:bg-white">View shop</Link>
        <SignOutLink className="inline-flex h-9 items-center rounded-pill px-4 text-left text-fs-14 font-medium transition hover:bg-white" />
      </div>
    </nav>
  );
}
