"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 lg:flex-col">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-pill px-4 py-2 text-[16px] font-medium transition",
              active ? "bg-ink text-white" : "hover:bg-cloud",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
