import { and, desc, ilike, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import { Pill } from "@/components/account/StatusPill";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { Card, DataTable, EmptyState, FilterTabs, Notice, PageHeader, Pagination, ResponsiveTable, Toolbar, td } from "@/components/admin/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers as subsTable } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const FILTERS = ["all", "active", "unsubscribed"] as const;

export default async function AdminNewsletterPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireAdmin("/admin/newsletter");
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? "all";
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let rows: (typeof subsTable.$inferSelect)[] = [];
  let total = 0;
  let counts = { all: 0, active: 0, unsubscribed: 0 };
  if (hasDb()) {
    const db = getDb();
    const search: SQL | undefined = q ? ilike(subsTable.email, `%${q.replace(/[%_\\]/g, "\\$&")}%`) : undefined;
    const byStatus = filter === "active" ? isNull(subsTable.unsubscribedAt) : filter === "unsubscribed" ? isNotNull(subsTable.unsubscribedAt) : undefined;
    const where = and(search, byStatus);
    const [list, [{ n }], [c]] = await Promise.all([
      db.select().from(subsTable).where(where).orderBy(desc(subsTable.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
      db.select({ n: sql<number>`count(*)::int` }).from(subsTable).where(where),
      db
        .select({
          all: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where ${subsTable.unsubscribedAt} is null)::int`,
        })
        .from(subsTable),
    ]);
    rows = list;
    total = n;
    counts = { all: c.all, active: c.active, unsubscribed: c.all - c.active };
  }
  const href = (p: { status?: string; page?: number }) => {
    const u = new URLSearchParams();
    if ((p.status ?? filter) !== "all") u.set("status", p.status ?? filter);
    if (q) u.set("q", q);
    if (p.page && p.page > 1) u.set("page", String(p.page));
    const s = u.toString();
    return `/admin/newsletter${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${counts.active} active subscriber${counts.active === 1 ? "" : "s"}. The welcome email is edited under Emails.`}
        actions={<ButtonLink href="/admin/newsletter/export" prefetch={false} variant="outline" size="sm">Export CSV</ButtonLink>}
      />
      {!hasDb() && <Notice>Set DATABASE_URL to collect subscribers.</Notice>}

      <Card title="Send an email" hint="Goes to active subscribers only, each with their own unsubscribe link." className="mb-6">
        <BroadcastForm recipients={counts.active} />
      </Card>

      <div className="mb-4 space-y-4">
        <FilterTabs tabs={FILTERS.map((f) => ({ label: f, href: href({ status: f }), active: f === filter, count: counts[f] }))} />
        <Toolbar action="/admin/newsletter" q={q} placeholder="Search email" hidden={{ status: filter === "all" ? undefined : filter }} count={`${total} subscriber${total === 1 ? "" : "s"}`} />
      </div>
      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title={q ? "No subscribers match your search" : "No subscribers yet"} body={q ? undefined : "People who sign up in the site footer appear here."} />
        ) : (
          <ResponsiveTable
            cards={rows.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="break-all text-fs-14 font-medium">{s.email}</p>
                  <p className="text-fs-12 text-mute">{s.createdAt.toLocaleDateString("en-NG")}</p>
                </div>
                {s.unsubscribedAt ? <Pill>Unsubscribed</Pill> : <Pill tone="outline">Active</Pill>}
              </li>
            ))}
          >
          <DataTable head={[{ label: "Email" }, { label: "Joined" }, { label: "Status" }]}>
            {rows.map((s) => (
              <tr key={s.id} className="transition hover:bg-cloud">
                <td className={td}>{s.email}</td>
                <td className={`${td} whitespace-nowrap text-mute`}>{s.createdAt.toLocaleDateString("en-NG")}</td>
                <td className={td}>{s.unsubscribedAt ? <Pill>Unsubscribed</Pill> : <Pill tone="outline">Active</Pill>}</td>
              </tr>
            ))}
          </DataTable>
          </ResponsiveTable>
        )}
        <Pagination page={page} pages={Math.ceil(total / PAGE_SIZE)} href={(n) => href({ page: n })} />
      </Card>
    </>
  );
}
