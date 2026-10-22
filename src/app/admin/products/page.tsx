import { inArray } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { BulkEditForm } from "@/components/admin/BulkEditForm";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { SelectAll } from "@/components/admin/SelectAll";
import { Pill } from "@/components/account/StatusPill";
import { SelectScope } from "@/components/admin/SelectScope";
import { Card, DataTable, EmptyState, FilterTabs, Notice, PageHeader, Pagination, ResponsiveTable, Toolbar, td } from "@/components/admin/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { getDb, hasDb } from "@/db";
import { orderItems } from "@/db/schema";
import { getAllProducts, getCategories } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { STOCK_STATUS_LABEL, stockStatus } from "@/lib/stock";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ show?: string; q?: string; page?: string }> }) {
  await requireAdmin("/admin/products");
  const sp = await searchParams;
  const showArchived = sp.show === "archived";
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [all, categories] = await Promise.all([getAllProducts({ includeArchived: true }), getCategories()]);
  const byArchive = all.filter((p) => Boolean(p.archived) === showArchived);
  const term = q.toLowerCase();
  const matches = term ? byArchive.filter((p) => `${p.name} ${p.slug} ${p.subtitle}`.toLowerCase().includes(term)) : byArchive;
  const products = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // products that appear in any order can only be archived, never deleted
  const ordered = new Set(
    hasDb() && products.length
      ? (await getDb().selectDistinct({ id: orderItems.productId }).from(orderItems).where(inArray(orderItems.productId, products.map((p) => p.id)))).map((r) => r.id)
      : [],
  );
  const category = (slug: string) => categories.find((c) => c.slug === slug);
  const activeCount = all.filter((p) => !p.archived).length;
  const href = (p: { show?: string; page?: number }) => {
    const u = new URLSearchParams();
    if ((p.show ?? (showArchived ? "archived" : "")) === "archived") u.set("show", "archived");
    if (q) u.set("q", q);
    if (p.page && p.page > 1) u.set("page", String(p.page));
    const s = u.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Products" actions={<ButtonLink href="/admin/products/new" size="sm">New product</ButtonLink>} />
      {!hasDb() && <Notice>Set DATABASE_URL to manage products; the storefront is showing the demo catalogue.</Notice>}

      <div className="mb-4 space-y-4">
        <FilterTabs
          tabs={[
            { label: "Active", href: href({ show: "" }), active: !showArchived, count: activeCount },
            { label: "Archived", href: href({ show: "archived" }), active: showArchived, count: all.length - activeCount },
          ]}
        />
        <Toolbar action="/admin/products" q={q} placeholder="Search products" hidden={{ show: showArchived ? "archived" : undefined }} count={`${matches.length} product${matches.length === 1 ? "" : "s"}`} />
      </div>
      {!showArchived && <BulkEditForm />}

      <Card flush>
        {products.length === 0 ? (
          <EmptyState
            title={q ? "No products match your search" : showArchived ? "No archived products" : "No products yet"}
            body={q ? "Try a different name or slug." : showArchived ? undefined : "Add your first product to start selling."}
            action={!q && !showArchived ? <ButtonLink href="/admin/products/new" size="sm">New product</ButtonLink> : undefined}
          />
        ) : (
          <>
          {!showArchived && (
            <SelectScope>
              <ul className="divide-y divide-hairline-soft">
                {products.map((p) => (
                  <ProductCardRow key={p.id} p={p} deletable={hasDb() && !ordered.has(p.id)} />
                ))}
              </ul>
            </SelectScope>
          )}
          <DataTable
            className={showArchived ? undefined : "hidden md:block"}
            head={[
              { label: "Select", node: !showArchived ? <SelectAll /> : null, className: "w-12" },
              { label: "Product" },
              { label: "Category" },
              { label: "Price", align: "right" },
              { label: "Stock", align: "right" },
              { label: "", className: "w-40" },
            ]}
          >
            {products.map((p) => {
              const status = stockStatus(p.stock);
              const cat = category(p.category);
              return (
                <tr key={p.id} className="transition hover:bg-cloud">
                  <td className={td}>
                    {!p.archived ? <input type="checkbox" name="ids" value={p.id} form="bulk-edit" aria-label={`Select ${p.name}`} className="size-5 accent-ink" /> : null}
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-cloud">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-mute">/{p.slug}</p>
                      </div>
                      {p.archived && <Pill>Archived</Pill>}
                    </div>
                  </td>
                  <td className={td}>
                    {cat?.name ?? p.category}
                    {p.subcategory && ` / ${cat?.subcategories.find((s) => s.slug === p.subcategory)?.name ?? p.subcategory}`}
                    <br />
                    <span className="capitalize text-mute">{p.gender}</span>
                  </td>
                  <td className={`${td} text-right tabular-nums`}>
                    {p.salePriceKobo ? (
                      <>
                        <span className="text-sale">{formatNaira(p.salePriceKobo)}</span>
                        <br />
                        <span className="text-mute line-through">{formatNaira(p.priceKobo)}</span>
                      </>
                    ) : (
                      formatNaira(p.priceKobo)
                    )}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <span className="tabular-nums">{p.stock}</span>
                    {status !== "in" && <Pill tone={status === "out" ? "dark" : "outline"} className="ml-2">{STOCK_STATUS_LABEL[status]}</Pill>}
                  </td>
                  <td className={td}>
                    <ProductRowActions id={p.id} name={p.name} slug={p.slug} archived={Boolean(p.archived)} deletable={hasDb() && !ordered.has(p.id)} />
                  </td>
                </tr>
              );
            })}
          </DataTable>
          </>
        )}
        <Pagination page={page} pages={Math.ceil(matches.length / PAGE_SIZE)} href={(n) => href({ page: n })} />
      </Card>
    </>
  );
}

type Row = Awaited<ReturnType<typeof getAllProducts>>[number];

/** Phone card: thumbnail, name, price, stock pill, a "⋯" sheet, and a checkbox shown only in select mode. */
function ProductCardRow({ p, deletable }: { p: Row; deletable: boolean }) {
  const status = stockStatus(p.stock);
  return (
    <li className="flex min-h-[72px] items-center gap-3 px-4 py-3">
      {!p.archived && (
        <input type="checkbox" name="ids" value={p.id} form="bulk-edit" aria-label={`Select ${p.name}`} className="hidden size-6 shrink-0 accent-ink group-data-[selecting=true]:block" />
      )}
      <Link href={`/admin/products/${p.id}/edit`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cloud">
          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{p.name}</p>
          <p className="text-fs-14 tabular-nums">{formatNaira(p.salePriceKobo ?? p.priceKobo)}</p>
          <p className="mt-0.5 text-fs-12 text-mute">
            {p.stock} in stock {status !== "in" && <Pill tone={status === "out" ? "dark" : "outline"} className="ml-1">{STOCK_STATUS_LABEL[status]}</Pill>}
          </p>
        </div>
      </Link>
      <ProductRowActions id={p.id} name={p.name} slug={p.slug} archived={Boolean(p.archived)} deletable={deletable} />
    </li>
  );
}
