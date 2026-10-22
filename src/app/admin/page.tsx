import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { StatusPill } from "@/components/account/StatusPill";
import { Card, DataTable, EmptyState, ListCard, Notice, PageHeader, ResponsiveTable, td } from "@/components/admin/ui/layout";
import { getDb, hasDb } from "@/db";
import { orders } from "@/db/schema";
import { expireStalePending } from "@/lib/orders";
import { getInventory } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { stockStatus } from "@/lib/stock";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin("/admin");
  let stats = { revenue: 0, orders: 0, paid: 0, pending: 0, oversold: 0 };
  let inventory: Awaited<ReturnType<typeof getInventory>> = [];
  let latest: (typeof orders.$inferSelect)[] = [];

  if (hasDb()) {
    await expireStalePending();
    const db = getDb();
    const [[o], inv, recent] = await Promise.all([
      db
        .select({
          orders: sql<number>`count(*)::int`,
          paid: sql<number>`count(*) filter (where ${orders.status} in ('paid','shipped','delivered'))::int`,
          pending: sql<number>`count(*) filter (where ${orders.status} = 'paid')::int`,
          oversold: sql<number>`count(*) filter (where ${orders.stockShortfall} and ${orders.status} in ('paid','shipped'))::int`,
          revenue: sql<number>`coalesce(sum(${orders.totalKobo}) filter (where ${orders.status} in ('paid','shipped','delivered')), 0)::float8`,
        })
        .from(orders),
      getInventory(),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
    ]);
    stats = { revenue: o.revenue, orders: o.orders, paid: o.paid, pending: o.pending, oversold: o.oversold };
    inventory = inv;
    latest = recent;
  }

  const low = inventory.filter((p) => stockStatus(p.stock) === "low" && !p.archived).length;
  const out = inventory.filter((p) => stockStatus(p.stock) === "out" && !p.archived).length;

  const kpis = [
    { label: "Revenue (paid)", value: formatNaira(stats.revenue), href: "/admin/orders" },
    { label: "Orders", value: String(stats.orders), href: "/admin/orders" },
    { label: "To ship", value: String(stats.pending), href: "/admin/orders?status=paid" },
    { label: "Low or sold out", value: String(low + out), href: "/admin/inventory" },
  ];

  const attention = [
    stats.pending > 0 && { text: `${stats.pending} paid order${stats.pending === 1 ? "" : "s"} waiting to ship`, href: "/admin/orders?status=paid" },
    stats.oversold > 0 && { text: `${stats.oversold} oversold order${stats.oversold === 1 ? "" : "s"}: stock didn't cover them`, href: "/admin/orders?status=paid" },
    out > 0 && { text: `${out} product${out === 1 ? "" : "s"} sold out`, href: "/admin/inventory?tab=out" },
    low > 0 && { text: `${low} product${low === 1 ? "" : "s"} running low`, href: "/admin/inventory?tab=low" },
  ].filter((a): a is { text: string; href: string } => Boolean(a));

  return (
    <>
      <PageHeader title="Dashboard" />
      {!hasDb() && <Notice>DATABASE_URL isn&apos;t set, so figures are zero and the storefront is using the demo catalogue.</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="rounded-xl border border-hairline-soft bg-white p-4 transition hover:border-ink lg:p-5">
            <p className="text-fs-14 text-mute">{k.label}</p>
            <p className="mt-2 text-fs-20 font-medium leading-tight md:text-fs-24">{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card title="Needs attention">
          {attention.length === 0 ? (
            <p className="text-fs-14 text-mute">Nothing needs attention.</p>
          ) : (
            <ul className="divide-y divide-hairline-soft">
              {attention.map((a) => (
                <li key={a.text}>
                  <Link href={a.href} className="flex items-center justify-between gap-3 py-3 text-fs-14 transition hover:text-mute">
                    {a.text}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Latest orders" flush actions={<Link href="/admin/orders" className="text-fs-14 font-medium underline underline-offset-4">View all</Link>}>
          {latest.length === 0 ? (
            <EmptyState title="No orders yet" body="Orders appear here as soon as customers check out." />
          ) : (
            <ResponsiveTable
              cards={latest.map((o) => (
                <ListCard key={o.id} href={`/admin/orders/${o.id}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{o.reference.slice(-8).toUpperCase()}</p>
                    <p className="truncate text-fs-14 text-mute">{o.shipping.fullName}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-fs-14 font-medium tabular-nums">{formatNaira(o.totalKobo)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </ListCard>
              ))}
            >
            <DataTable head={[{ label: "Order" }, { label: "Customer" }, { label: "Total", align: "right" }, { label: "Status" }]}>
              {latest.map((o) => (
                <tr key={o.id} className="transition hover:bg-cloud">
                  <td className={`${td} font-medium`}>
                    <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4">{o.reference.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className={td}>{o.shipping.fullName}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatNaira(o.totalKobo)}</td>
                  <td className={td}><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </DataTable>
            </ResponsiveTable>
          )}
        </Card>
      </div>
    </>
  );
}
