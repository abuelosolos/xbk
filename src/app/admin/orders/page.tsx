import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatusPill } from "@/components/account/StatusPill";
import { getDb, hasDb } from "@/db";
import { orders, orderStatus } from "@/db/schema";
import { expireStalePending } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";
import { cn, formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = ["all", ...orderStatus.enumValues] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("/admin/orders");
  await expireStalePending();
  const { status } = await searchParams;
  const filter = FILTERS.find((f) => f === status) ?? "all";
  const query = hasDb() ? getDb().select().from(orders) : null;
  const rows = query ? await (filter === "all" ? query : query.where(eq(orders.status, filter))).orderBy(desc(orders.createdAt)).limit(100) : [];

  return (
    <>
      <h1 className="mb-4 text-fs-32 font-medium leading-tight">Orders</h1>
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={cn("rounded-pill px-4 py-1.5 text-fs-14 font-medium capitalize", f === filter ? "bg-ink text-white" : "bg-cloud hover:bg-hairline-soft")}
          >
            {f}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="text-fs-16 text-mute">{hasDb() ? "No orders here." : "Set DATABASE_URL to see orders."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-fs-14">
            <thead className="border-b border-hairline text-mute">
              <tr>
                <th className="py-3 pr-4 font-medium">Ref</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">State</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4 font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4">{o.reference.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="py-3 pr-4">{o.shipping.fullName}<br /><span className="text-mute">{o.email}</span></td>
                  <td className="py-3 pr-4">{o.shipping.state}</td>
                  <td className="py-3 pr-4">{formatNaira(o.totalKobo)}</td>
                  <td className="py-3 pr-4"><StatusPill status={o.status} />{o.stockShortfall && <span className="ml-2 text-fs-12 font-medium text-ink underline">Oversold</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
