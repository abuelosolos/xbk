import Link from "next/link";
import { StockForm } from "@/components/admin/StockForm";
import { hasDb } from "@/db";
import { expireStalePending } from "@/lib/orders";
import { getCategories, getInventory, getOversoldOrders } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { LOW_STOCK_THRESHOLD, STOCK_STATUS_LABEL, stockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "low", label: `Low (≤ ${LOW_STOCK_THRESHOLD})` },
  { key: "out", label: "Sold out" },
  { key: "archived", label: "Archived" },
] as const;

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ show?: string; q?: string }> }) {
  await requireAdmin("/admin/inventory");
  const { show, q = "" } = await searchParams;
  const tab = TABS.find((t) => t.key === show)?.key ?? "all";

  if (!hasDb()) {
    return (
      <>
        <h1 className="mb-6 text-fs-32 font-medium leading-tight">Inventory</h1>
        <p className="bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to manage stock.</p>
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
  const href = (key: string) => `/admin/inventory?show=${key}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <>
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Inventory</h1>
      <p className="mb-6 max-w-xl text-fs-16 text-mute">
        One stock number per product. Changes add or remove units, so a sale made at the same moment is never overwritten. Every change is logged.
      </p>

      {oversold.length > 0 && (
        <section className="mb-8 bg-cloud p-5" aria-label="Needs attention">
          <h2 className="mb-2 text-fs-16 font-medium">Needs attention: paid while out of stock</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-fs-14">
            {oversold.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="font-medium underline underline-offset-4">{o.reference.slice(-8).toUpperCase()}</Link>{" "}
                <span className="text-mute">{o.createdAt.toLocaleDateString("en-NG")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <nav aria-label="Stock filter" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link key={t.key} href={href(t.key)} className={cn("rounded-pill px-4 py-1.5 text-fs-14 font-medium", t.key === tab ? "bg-ink text-white" : "bg-cloud hover:bg-hairline-soft")}>
              {t.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/inventory" className="ml-auto">
          <input type="hidden" name="show" value={tab} />
          <input name="q" defaultValue={q} placeholder="Search products" aria-label="Search products" className="h-9 rounded-pill border border-hairline px-4 text-fs-14 outline-none focus:border-ink" />
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-fs-16 text-mute">Nothing matches.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-fs-14">
            <thead className="border-b border-hairline text-mute">
              <tr>
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Change stock</th>
                <th className="py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft align-top">
              {rows.map((p) => {
                const status = stockStatus(p.stock);
                return (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <span className="font-medium">{p.name}</span>
                      <br />
                      <span className="text-mute">{categoryName(p.category)}</span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span className="font-medium tabular-nums">{p.stock}</span>
                      {status !== "in" && <span className="ml-2 rounded-pill border border-ink px-2 py-0.5 text-fs-12 font-medium">{STOCK_STATUS_LABEL[status]}</span>}
                    </td>
                    <td className="py-3 pr-4"><StockForm id={p.id} /></td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <Link href={`/admin/inventory/${p.id}`} className="font-medium underline underline-offset-4">History</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
