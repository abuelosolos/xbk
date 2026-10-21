"use client";

import { useState } from "react";
import { OrdersPanel, type OrderRow } from "@/components/account/OrdersPanel";
import type { SavedAddress } from "@/lib/addresses";
import { SettingsPanel } from "@/components/account/SettingsPanel";
import { cn } from "@/lib/utils";

const TABS = ["orders", "settings"] as const;

/** Top-level account sections: "Orders" and "Settings" headings side by side. */
export function AccountTabs({
  orders,
  user,
  addresses,
  initialTab,
  initialSection,
}: {
  orders: OrderRow[];
  user: { name: string; email: string };
  addresses: SavedAddress[];
  initialTab?: string;
  initialSection?: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(initialTab === "settings" ? "settings" : "orders");

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-6 md:mb-8 md:gap-8">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "text-fs-24 font-medium capitalize transition-colors",
              tab === t ? "text-ink" : "text-mute hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "orders" ? <OrdersPanel orders={orders} /> : <SettingsPanel user={user} addresses={addresses} initialSection={initialSection} />}
    </div>
  );
}
