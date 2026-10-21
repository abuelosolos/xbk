"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { FramedImage } from "@/components/product/FramedImage";
import { StatusPill } from "@/components/account/StatusPill";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type OrderRow = {
  id: string;
  reference: string;
  ref: string;
  date: string;
  items: number;
  name: string;
  image: string | null;
  total: string;
  status: "pending" | "paid" | "failed" | "shipped" | "delivered";
};

const TABS = ["all", "pending", "paid", "shipped", "delivered"] as const;

export function OrdersPanel({ orders }: { orders: OrderRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const shown = tab === "all" ? orders : orders.filter((o) => o.status === tab);

  return (
    <section aria-label="Orders">
      <div role="tablist" className="scrollbar-none -mx-4 flex gap-6 overflow-x-auto px-4 shadow-[inset_0_-1px_0_var(--color-hairline-soft)] md:-mx-0 md:gap-8 md:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative -mb-px shrink-0 py-3 text-fs-16 font-medium capitalize transition-colors",
              tab === t ? "text-ink" : "text-mute hover:text-ink",
            )}
          >
            {t}
            {tab === t && (
              <motion.span
                layoutId="orders-tab-underline"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 grid gap-2 md:mt-8 md:grid-cols-[minmax(0,276px)]">
          <Link
            href="/shop"
            className="flex min-h-[200px] flex-col items-center justify-center gap-4 bg-cloud p-6 text-center transition hover:bg-hairline-soft md:min-h-[240px]"
          >
            <Plus size={28} />
            <span className="text-fs-16 font-medium">{tab === "all" ? "Start Shopping" : `No ${tab} orders`}</span>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-hairline-soft">
          {shown.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.reference}`}
                className="-mx-4 flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-cloud md:-mx-6 md:px-6"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <FramedImage src={o.image} label={o.name} sizes="64px" className="size-14 shrink-0 rounded-[6px] md:size-16" />
                  <div className="flex h-14 min-w-0 flex-col justify-center gap-0.5 md:h-16">
                    <p className="truncate text-fs-16 font-medium">{o.name}</p>
                    <p className="truncate text-fs-14 text-mute">
                      {o.ref} · {o.date}
                      {o.items > 1 && ` · ${o.items} items`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-fs-16 font-medium">{o.total}</p>
                    <StatusPill status={o.status} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
