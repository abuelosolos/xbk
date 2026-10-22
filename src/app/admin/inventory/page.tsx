import Link from "next/link";
import { StockForm } from "@/components/admin/StockForm";
import { hasDb } from "@/db";
import { expireStalePending } from "@/lib/orders";
import { getCategories, getInventory, getOversoldOrders } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { LOW_STOCK_THRESHOLD, STOCK_STATUS_LABEL, stockStatus } from "@/lib/stock";
import { Pill } from "@/components/account/StatusPill";
import { Card, DataTable, EmptyState, FilterTabs, Notice, PageHeader, Pagination, ResponsiveTable, Toolbar, td } from "@/components/admin/ui/layout";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "low", label: `Low (≤ ${LOW_STOCK_THRESHOLD})` },
  { key: "out", label: "Sold out" },
  { key: "archived", label: "Archived" },
] as const;

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ show?: string; q?: string; tab?: string; page?: string }> }) {
  await requireAdmin("/admin/inventory");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const tab = TABS.find((t) => t.key === (sp.show ?? sp.tab))?.key ?? "all";

  if (!hasDb()) {
    return (
      <>
        <PageHeader title="Inventory" />
        <Notice>Set DATABASE_URL to manage stock.</Notice>
      </>
    );
  }

  await expireStalePending();
  const [all, categories, oversold] = await Promise.all([getInventory(), getCategories(), getOversoldOrders()]);
  const query = q.trim().toLowerCase();
  const rows = all.filter((p) => {
    if (query && !`${p.name} ${p.slug}`.toLowerCase().includes(query)) return false;
    if (tab === "archived") return p.archived;
    if (p.archived) return false;
    if (tab === "low") return stockStatus(p.stock) === "low";
    if (tab === "out") return stockStatus(p.stock) === "out";
    return true;
  });
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const PAGE_SIZE = 25;
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const href = (key: string, n = 1) => `/admin/inventory?show=${key}${query ? `&q=${encodeURIComponent(query)}` : ""}${n > 1 ? `&page=${n}` : ""}`;
  const count = (key: (typeof TABS)[number]["key"]) =>
    all.filter((p) => (key === "archived" ? p.archived : !p.archived && (key === "all" || stockStatus(p.stock) === key))).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        description="One stock number per product. Changes add or remove units, so a sale made at the same moment is never overwritten. Every change is logged."
      />

      {oversold.length > 0 && (
        <Notice role="alert">
          <span className="font-medium">Needs attention: paid while out of stock.</span>{" "}
          {oversold.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="mr-3 inline-block font-medium underline underline-offset-4">
              {o.reference.slice(-8).toUpperCase()} <span className="font-normal text-mute">{o.createdAt.toLocaleDateString("en-NG")}</span>
            </Link>
          ))}
        </Notice>
      )}

      <div className="mb-4 space-y-4">
        <FilterTabs tabs={TABS.map((t) => ({ label: t.label, href: href(t.key), active: t.key === tab, count: count(t.key) }))} />
        <Toolbar action="/admin/inventory" q={q} placeholder="Search products" hidden={{ show: tab }} count={`${rows.length} product${rows.length === 1 ? "" : "s"}`} />
      </div>

      <Card flush>
        {rows.length === 0 ? (
          <EmptyState title="Nothing matches" body="Try another filter or search." />
        ) : (
          <ResponsiveTable
            cards={shown.map((p) => {
              const status = stockStatus(p.stock);
              return (
                <li key={p.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-fs-14 text-mute">{categoryName(p.category)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-fs-16 font-medium tabular-nums">{p.stock}</span>
                      {status !== "in" && <Pill tone={status === "out" ? "dark" : "outline"}>{STOCK_STATUS_LABEL[status]}</Pill>}
                    </div>
                  </div>
                  <div className="mt-3"><StockForm id={p.id} /></div>
                  <Link href={`/admin/inventory/${p.id}`} className="mt-2 flex h-11 items-center text-fs-14 font-medium underline underline-offset-4">History</Link>
                </li>
              );
            })}
          >
          <DataTable head={[{ label: "Product" }, { label: "Stock", align: "right" }, { label: "Change stock" }, { label: "", className: "w-24" }]}>
            {shown.map((p) => {
              const status = stockStatus(p.stock);
              return (
                <tr key={p.id} className="align-top transition hover:bg-cloud">
                  <td className={td}>
                    <span className="font-medium">{p.name}</span>
                    <br />
                    <span className="text-mute">{categoryName(p.category)}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <span className="font-medium tabular-nums">{p.stock}</span>
                    {status !== "in" && <Pill tone={status === "out" ? "dark" : "outline"} className="ml-2">{STOCK_STATUS_LABEL[status]}</Pill>}
                  </td>
                  <td className={td}><StockForm id={p.id} /></td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Link href={`/admin/inventory/${p.id}`} className="font-medium underline underline-offset-4">History</Link>
                  </td>
                </tr>
              );
            })}
          </DataTable>
          </ResponsiveTable>
        )}
        <Pagination page={page} pages={Math.ceil(rows.length / PAGE_SIZE)} href={(n) => href(tab, n)} />
      </Card>
    </>
  );
}
