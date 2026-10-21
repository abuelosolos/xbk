import { inArray } from "drizzle-orm";
import Link from "next/link";
import { BulkEditForm } from "@/components/admin/BulkEditForm";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { getDb, hasDb } from "@/db";
import { orderItems } from "@/db/schema";
import { Button } from "@/components/ui/Button";
import { getAllProducts, getCategories } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { cn, formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin("/admin/products");
  const showArchived = (await searchParams).show === "archived";
  const [all, categories] = await Promise.all([getAllProducts({ includeArchived: true }), getCategories()]);
  const products = all.filter((p) => Boolean(p.archived) === showArchived);
  // products that appear in any order can only be archived, never deleted
  const ordered = new Set(
    hasDb() && products.length
      ? (await getDb().selectDistinct({ id: orderItems.productId }).from(orderItems).where(inArray(orderItems.productId, products.map((p) => p.id)))).map((r) => r.id)
      : [],
  );
  const category = (slug: string) => categories.find((c) => c.slug === slug);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-fs-32 font-medium leading-tight">Products</h1>
        <Link href="/admin/products/new"><Button size="sm">New product</Button></Link>
      </div>

      <nav aria-label="Product list" className="mb-6 flex gap-2">
        {[{ label: "Active", href: "/admin/products", on: !showArchived }, { label: "Archived", href: "/admin/products?show=archived", on: showArchived }].map((t) => (
          <Link key={t.label} href={t.href} className={cn("rounded-pill px-4 py-1.5 text-fs-14 font-medium", t.on ? "bg-ink text-white" : "bg-cloud hover:bg-hairline-soft")}>{t.label}</Link>
        ))}
      </nav>

      {!showArchived && products.length > 0 && <BulkEditForm />}
      {products.length === 0 && <p className="text-fs-16 text-mute">{showArchived ? "No archived products." : "No products yet."}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-fs-14">
          <thead className="border-b border-hairline text-mute">
            <tr>
              <th className="w-8 py-3 pr-2" />
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Category</th>
              <th className="py-3 pr-4 font-medium">Price</th>
              <th className="py-3 pr-4 font-medium">Stock</th>
              <th className="py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-2">
                  {!p.archived && <input type="checkbox" name="ids" value={p.id} form="bulk-edit" aria-label={`Select ${p.name}`} className="size-4 accent-ink" />}
                </td>
                <td className="py-3 pr-4 font-medium">{p.name}{p.archived && <span className="ml-2 text-fs-12 font-normal text-mute">Archived</span>}</td>
                <td className="py-3 pr-4">
                  {category(p.category)?.name ?? p.category}
                  {p.subcategory && ` / ${category(p.category)?.subcategories.find((s) => s.slug === p.subcategory)?.name ?? p.subcategory}`}
                  <span className="capitalize"> · {p.gender}</span>
                </td>
                <td className="py-3 pr-4">
                  {p.salePriceKobo ? <><span className="text-sale">{formatNaira(p.salePriceKobo)}</span> <span className="text-mute line-through">{formatNaira(p.priceKobo)}</span></> : formatNaira(p.priceKobo)}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap"><span className="tabular-nums">{p.stock}</span> <Link href="/admin/inventory" className="ml-1 text-mute underline underline-offset-4">Manage</Link></td>
                <td className="py-3">
                  <ProductRowActions id={p.id} name={p.name} archived={Boolean(p.archived)} deletable={hasDb() && !ordered.has(p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
