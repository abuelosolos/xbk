import { ActionForm } from "@/components/admin/ActionForm";
import { hasDb } from "@/db";
import { getCategories } from "@/lib/products";
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

const input = "h-9 rounded-pill border border-hairline px-3 text-fs-14 outline-none focus:border-ink";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");
  const categories = await getCategories();
  if (!hasDb()) {
    return (
      <>
        <h1 className="mb-6 text-fs-32 font-medium leading-tight">Categories</h1>
        <p className="bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to manage categories.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Categories</h1>
      <p className="mb-8 max-w-xl text-fs-16 text-mute">
        Slugs are fixed once created because they appear in storefront URLs. Lower order numbers show first. A category can be deleted once no products or sub-categories use it.
      </p>

      <div className="space-y-8">
        {categories.map((c) => (
          <section key={c.slug} className="bg-cloud p-5">
            <ActionForm action={updateCategory} submit="Save">
              <input type="hidden" name="slug" value={c.slug} />
              <input name="name" defaultValue={c.name} aria-label={`${c.name} name`} className={input} />
              <input name="sortOrder" defaultValue={c.sortOrder ?? 0} inputMode="numeric" aria-label={`${c.name} order`} className={`${input} w-20`} />
              <span className="text-fs-12 text-mute">/{c.slug}</span>
            </ActionForm>
            <ActionForm action={deleteCategory} submit="Delete category" confirmText={`Delete ${c.name}?`} className="mt-2">
              <input type="hidden" name="slug" value={c.slug} />
            </ActionForm>

            <ul className="mt-4 space-y-2 border-t border-hairline pt-4">
              {c.subcategories.map((s) => (
                <li key={s.slug} className="flex flex-wrap items-center gap-2">
                  <ActionForm action={updateSubcategory} submit="Save">
                    <input type="hidden" name="category" value={c.slug} />
                    <input type="hidden" name="slug" value={s.slug} />
                    <input name="name" defaultValue={s.name} aria-label={`${s.name} name`} className={input} />
                    <input name="sortOrder" defaultValue={s.sortOrder ?? 0} inputMode="numeric" aria-label={`${s.name} order`} className={`${input} w-20`} />
                    <span className="text-fs-12 text-mute">/{s.slug}</span>
                  </ActionForm>
                  <ActionForm action={deleteSubcategory} submit="Delete" confirmText={`Delete ${s.name}?`}>
                    <input type="hidden" name="category" value={c.slug} />
                    <input type="hidden" name="slug" value={s.slug} />
                  </ActionForm>
                </li>
              ))}
            </ul>

            <ActionForm action={createSubcategory} submit="Add sub-category" variant="primary" className="mt-4 flex flex-wrap items-center gap-2">
              <input type="hidden" name="category" value={c.slug} />
              <input name="name" placeholder="New sub-category" aria-label={`New sub-category in ${c.name}`} className={input} />
              <input name="slug" placeholder="slug (optional)" aria-label="Slug" className={input} />
            </ActionForm>
          </section>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-fs-20 font-medium">New category</h2>
      <ActionForm action={createCategory} submit="Add category" variant="primary">
        <input name="name" placeholder="Name" aria-label="Category name" className={input} />
        <input name="slug" placeholder="slug (optional)" aria-label="Slug" className={input} />
        <input name="sortOrder" placeholder="Order" inputMode="numeric" aria-label="Order" className={`${input} w-20`} />
      </ActionForm>
    </>
  );
}
