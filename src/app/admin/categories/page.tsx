import { ActionForm } from "@/components/admin/ActionForm";
import { Card, Notice, PageHeader } from "@/components/admin/ui/layout";
import { hasDb } from "@/db";
import { getAllProducts, getCategories } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  updateCategory,
  updateSubcategory,
} from "./actions";

export const dynamic = "force-dynamic";

const input = "h-10 rounded-pill border border-hairline bg-white px-4 text-fs-14 outline-none focus:border-ink";
const colHead = "text-fs-12 font-medium uppercase tracking-wide text-mute";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");
  const [categories, products] = await Promise.all([getCategories(), getAllProducts({ includeArchived: true })]);
  if (!hasDb()) {
    return (
      <>
        <PageHeader title="Categories" />
        <Notice>Set DATABASE_URL to manage categories.</Notice>
      </>
    );
  }
  const inCategory = (slug: string) => products.filter((p) => p.category === slug).length;
  const inSub = (cat: string, slug: string) => products.filter((p) => p.category === cat && p.subcategory === slug).length;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Slugs are fixed once created because they appear in storefront URLs. Lower order numbers show first. A category can be deleted once no products or sub-categories use it."
      />

      <div className="space-y-6">
        {categories.map((c) => (
          <Card key={c.slug} title={c.name} hint={`/${c.slug} · ${inCategory(c.slug)} product${inCategory(c.slug) === 1 ? "" : "s"}`}>
            <div className="mb-2 grid grid-cols-[1fr_5rem] gap-2 sm:max-w-md">
              <span className={colHead}>Name</span>
              <span className={colHead}>Order</span>
            </div>
            <ActionForm action={updateCategory} submit="Save">
              <input type="hidden" name="slug" value={c.slug} />
              <input name="name" defaultValue={c.name} aria-label={`${c.name} name`} className={`${input} w-56`} />
              <input name="sortOrder" defaultValue={c.sortOrder ?? 0} inputMode="numeric" aria-label={`${c.name} order`} className={`${input} w-20`} />
            </ActionForm>

            {c.subcategories.length > 0 && (
              <div className="mt-5 border-t border-hairline-soft pt-4">
                <p className={`${colHead} mb-3`}>Sub-categories</p>
                <ul className="space-y-3">
                  {c.subcategories.map((s) => (
                    <li key={s.slug} className="flex flex-wrap items-center gap-2">
                      <ActionForm action={updateSubcategory} submit="Save">
                        <input type="hidden" name="category" value={c.slug} />
                        <input type="hidden" name="slug" value={s.slug} />
                        <input name="name" defaultValue={s.name} aria-label={`${s.name} name`} className={`${input} w-56`} />
                        <input name="sortOrder" defaultValue={s.sortOrder ?? 0} inputMode="numeric" aria-label={`${s.name} order`} className={`${input} w-20`} />
                      </ActionForm>
                      <span className="text-fs-14 text-mute">{inSub(c.slug, s.slug)} product{inSub(c.slug, s.slug) === 1 ? "" : "s"}</span>
                      <ActionForm action={deleteSubcategory} submit="Delete" variant="secondary" confirmText={`Delete ${s.name}?`}>
                        <input type="hidden" name="category" value={c.slug} />
                        <input type="hidden" name="slug" value={s.slug} />
                      </ActionForm>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline-soft pt-4">
              <ActionForm action={createSubcategory} submit="Add sub-category" variant="primary">
                <input type="hidden" name="category" value={c.slug} />
                <input name="name" placeholder="New sub-category" aria-label={`New sub-category in ${c.name}`} className={input} />
                <input name="slug" placeholder="slug (optional)" aria-label="Slug" className={input} />
              </ActionForm>
              <ActionForm action={deleteCategory} submit="Delete category" confirmText={`Delete ${c.name}?`}>
                <input type="hidden" name="slug" value={c.slug} />
              </ActionForm>
            </div>
          </Card>
        ))}

        <Card title="New category">
          <ActionForm action={createCategory} submit="Add category" variant="primary">
            <input name="name" placeholder="Name" aria-label="Category name" className={input} />
            <input name="slug" placeholder="slug (optional)" aria-label="Slug" className={input} />
            <input name="sortOrder" placeholder="Order" inputMode="numeric" aria-label="Order" className={`${input} w-20`} />
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
