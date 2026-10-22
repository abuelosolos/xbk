import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";
import { StatusPill } from "@/components/account/StatusPill";
import { Card, DataTable, EmptyState, FilterTabs, ListCard, Notice, PageHeader, Pagination, ResponsiveTable, Toolbar, td } from "@/components/admin/ui/layout";
import { Pill } from "@/components/account/StatusPill";
import { getDb, hasDb } from "@/db";
import { orders, orderStatus } from "@/db/schema";
import { expireStalePending } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = ["all", ...orderStatus.enumValues] as const;
const PAGE_SIZE = 20;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireAdmin("/admin/orders");
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? "all";
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let rows: (typeof orders.$inferSelect)[] = [];
  let total = 0;
  const counts: Record<string, number> = {};

  if (hasDb()) {
    await expireStalePending();
    const db = getDb();
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    const search: SQL | undefined = q
      ? or(ilike(orders.reference, like), ilike(orders.email, like), sql`${orders.shipping}->>'fullName' ilike ${like}`)
      : undefined;
    const where = and(filter === "all" ? undefined : eq(orders.status, filter), search);
    const [list, [{ n }], grouped] = await Promise.all([
      db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
      db.select({ n: sql<number>`count(*)::int` }).from(orders).where(where),
      db.select({ status: orders.status, n: sql<number>`count(*)::int` }).from(orders).where(search).groupBy(orders.status),
    ]);
    rows = list;
    total = n;
    for (const g of grouped) counts[g.status] = g.n;
  }
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const href = (params: { status?: string; page?: number }) => {
    const u = new URLSearchParams();
    if ((params.status ?? filter) !== "all") u.set("status", params.status ?? filter);
    if (q) u.set("q", q);
    if (params.page && params.page > 1) u.set("page", String(params.page));
    const s = u.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Orders" />
      {!hasDb() && <Notice>Set DATABASE_URL to see orders.</Notice>}
      <div className="mb-4 space-y-4">
        <FilterTabs tabs={FILTERS.map((f) => ({ label: f, href: href({ status: f }), active: f === filter, count: f === "all" ? all : (counts[f] ?? 0) }))} />
        <Toolbar action="/admin/orders" q={q} placeholder="Search reference, email or name" hidden={{ status: filter === "all" ? undefined : filter }} count={`${total} order${total === 1 ? "" : "s"}`} />
      </div>
      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title={q ? "No orders match your search" : "No orders here"} body={q ? "Try a different reference, email or name." : "Orders appear as customers check out."} />
        ) : (
          <ResponsiveTable
            cards={rows.map((o) => (
              <ListCard key={o.id} href={`/admin/orders/${o.id}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{o.reference.slice(-8).toUpperCase()}</p>
                  <p className="truncate text-fs-14">{o.shipping.fullName}</p>
                  <p className="text-fs-14 text-mute">
                    {o.createdAt.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} · {o.shipping.state}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-fs-14 font-medium tabular-nums">{formatNaira(o.totalKobo)}</span>
                  <StatusPill status={o.status} />
                  {o.stockShortfall && <Pill tone="outline">Oversold</Pill>}
                </div>
              </ListCard>
            ))}
          >
          <DataTable head={[{ label: "Order" }, { label: "Date" }, { label: "Customer" }, { label: "State" }, { label: "Total", align: "right" }, { label: "Status" }]}>
            {rows.map((o) => (
              <tr key={o.id} className="transition hover:bg-cloud">
                <td className={`${td} font-medium`}>
                  <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-4">
                    {o.reference.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap text-mute`}>{o.createdAt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className={`${td} break-words`}>{o.shipping.fullName}<br /><span className="text-mute">{o.email}</span></td>
                <td className={td}>{o.shipping.state}</td>
                <td className={`${td} text-right tabular-nums`}>{formatNaira(o.totalKobo)}</td>
                <td className={`${td} whitespace-nowrap`}>
                  <StatusPill status={o.status} />
                  {o.stockShortfall && <Pill tone="outline" className="ml-2">Oversold</Pill>}
                </td>
              </tr>
            ))}
          </DataTable>
          </ResponsiveTable>
        )}
        <Pagination page={page} pages={Math.ceil(total / PAGE_SIZE)} href={(p) => href({ page: p })} />
      </Card>
    </>
  );
}
