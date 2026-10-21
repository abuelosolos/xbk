"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

/** Category + sub-category pickers; the sub-category list follows the chosen category. */
export function CategoryFields({ categories, className }: { categories: Category[]; className: string }) {
  const [slug, setSlug] = useState(categories[0]?.slug ?? "");
  const subs = categories.find((c) => c.slug === slug)?.subcategories ?? [];

  return (
    <>
      <select name="category" required value={slug} onChange={(e) => setSlug(e.target.value)} className={className} aria-label="Category">
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>
      {/* keyed on the category so a stale sub-category is never submitted with a different category */}
      <select key={slug} name="subcategory" defaultValue="" className={className} aria-label="Sub-category">
        <option value="">No sub-category</option>
        {subs.map((s) => (
          <option key={s.slug} value={s.slug}>{s.name}</option>
        ))}
      </select>
    </>
  );
}
