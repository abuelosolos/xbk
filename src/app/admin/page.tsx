import { requireAdmin } from "@/lib/session";
import { sql } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { orders, products } from "@/db/schema";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin("/admin");
  let stats = { revenue: 0, orders: 0, paid: 0, products: 0 };

  if (hasDb()) {
    const db = getDb();
    const [o] = await db
      .select({
        orders: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where ${orders.status} in ('paid','shipped','delivered'))::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalKobo}) filter (where ${orders.status} in ('paid','shipped','delivered')), 0)::float8`,
      })
      .from(orders);
    const [p] = await db.select({ n: sql<number>`count(*)::int` }).from(products);
    stats = { revenue: o.revenue, orders: o.orders, paid: o.paid, products: p.n };
  }

  const cards = [
    { label: "Revenue (paid)", value: formatNaira(stats.revenue) },
    { label: "Orders", value: String(stats.orders) },
    { label: "Paid orders", value: String(stats.paid) },
    { label: "Products", value: String(stats.products) },
  ];

  return (
    <>
      <h1 className="mb-6 text-fs-32 font-medium leading-tight">Dashboard</h1>
      {!hasDb() && (
        <p className="mb-6 bg-cloud p-4 text-fs-14 text-charcoal">
          DATABASE_URL isn&apos;t set, so figures are zero and the storefront is using the demo catalogue.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-cloud p-5">
            <p className="text-fs-14 text-mute">{c.label}</p>
            <p className="mt-2 text-fs-24 font-medium">{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
