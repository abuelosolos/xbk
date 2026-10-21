import type { Metadata } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AccountTabs } from "@/components/account/AccountTabs";
import type { OrderRow } from "@/components/account/OrdersPanel";
import { ScrollRow } from "@/components/account/ScrollRow";
import { ProductCard } from "@/components/product/ProductCard";
import { listAddresses } from "@/lib/addresses";
import { getDb, hasDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getAllProducts, getProductsByIds } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const date = (d: Date) => d.toLocaleDateString("en-NG", { dateStyle: "medium" });
const memberSince = (d: Date) => d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string; section?: string }> }) {
  const { tab, section } = await searchParams;
  const session = await requireUser("/account");
  const addresses = await listAddresses(session.user.id).catch(() => []);
  const db = hasDb() ? getDb() : null;
  const myOrders = db
    ? await db.select().from(orders).where(eq(orders.userId, session.user.id)).orderBy(desc(orders.createdAt))
    : [];
  const lines = new Map<string, { productId: string; name: string; qty: number }[]>();
  if (db && myOrders.length > 0) {
    const rows = await db
      .select({ orderId: orderItems.orderId, productId: orderItems.productId, name: orderItems.name, qty: orderItems.qty })
      .from(orderItems)
      .where(inArray(orderItems.orderId, myOrders.map((o) => o.id)));
    for (const r of rows) lines.set(r.orderId, [...(lines.get(r.orderId) ?? []), r]);
  }
  const firstProducts = new Map(
    (await getProductsByIds([...new Set([...lines.values()].map((l) => l[0].productId))], { includeArchived: true })).map((p) => [p.id, p]),
  );

  const rows: OrderRow[] = myOrders.map((o) => {
    const l = lines.get(o.id) ?? [];
    return {
      id: o.id,
      reference: o.reference,
      ref: o.reference.slice(-8).toUpperCase(),
      date: date(o.createdAt),
      items: l.reduce((n, i) => n + i.qty, 0),
      name: l[0] ? l[0].name + (l.length > 1 ? ` +${l.length - 1} more` : "") : `Order ${o.reference.slice(-8).toUpperCase()}`,
      image: l[0] ? (firstProducts.get(l[0].productId)?.images[0] ?? null) : null,
      total: formatNaira(o.totalKobo),
      status: o.status,
    };
  });
  const suggestions = (await getAllProducts()).slice(0, 8);

  const initials = session.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-8 md:pt-12 lg:px-12 lg:pb-24 lg:pt-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <div
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full bg-hairline-soft text-fs-24 font-medium md:size-24 md:text-fs-32"
          >
            {initials || "X"}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-fs-32 font-medium leading-tight">{session.user.name}</h1>
            <p className="text-fs-14 text-mute md:text-fs-16">XBK Member Since {memberSince(session.user.createdAt)}</p>
          </div>
        </div>
        <div className="hidden md:block">
          <SignOutButton />
        </div>
      </header>

      <div className="mt-12 lg:mt-16">
        <AccountTabs
          orders={rows}
          user={{ name: session.user.name, email: session.user.email }}
          addresses={addresses}
          initialTab={tab}
          initialSection={section}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-12 lg:mt-16">
          <ScrollRow title="Find your next favourite">
            {suggestions.map((p, i) => (
              <li key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[calc((100%-24px)/4)]">
                <ProductCard product={p} index={i} />
              </li>
            ))}
          </ScrollRow>
        </div>
      )}
    </div>
  );
}
