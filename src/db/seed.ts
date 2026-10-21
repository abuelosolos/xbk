import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/** Safe to re-run: everything is upserted by slug. Existing stock levels are left alone. */
async function main() {
  // Imported after env is loaded so DATABASE_URL is available.
  const { getDb } = await import("./index");
  const { categories, products, subcategories } = await import("./schema");
  const { CATEGORIES } = await import("./catalog-data");
  const { MOCK_PRODUCTS } = await import("./mock-products");

  const db = getDb();

  // slug -> id, and "category/sub" -> id, filled as rows are upserted
  const categoryIds = new Map<string, string>();
  const subcategoryIds = new Map<string, string>();

  for (const [i, c] of CATEGORIES.entries()) {
    const [row] = await db
      .insert(categories)
      .values({ slug: c.slug, name: c.name, sortOrder: i + 1 })
      .onConflictDoUpdate({ target: categories.slug, set: { name: c.name, sortOrder: i + 1 } })
      .returning({ id: categories.id });
    categoryIds.set(c.slug, row.id);

    for (const [j, s] of c.subcategories.entries()) {
      const [sub] = await db
        .insert(subcategories)
        .values({ categoryId: row.id, slug: s.slug, name: s.name, sortOrder: j + 1 })
        .onConflictDoUpdate({
          target: [subcategories.categoryId, subcategories.slug],
          set: { name: s.name, sortOrder: j + 1 },
        })
        .returning({ id: subcategories.id });
      subcategoryIds.set(`${c.slug}/${s.slug}`, sub.id);
    }
  }

  for (const p of MOCK_PRODUCTS) {
    const { id: _id, category, subcategory, ...rest } = p;
    const categoryId = categoryIds.get(category);
    if (!categoryId) throw new Error(`${p.slug}: unknown category "${category}"`);
    const subcategoryId = subcategory ? subcategoryIds.get(`${category}/${subcategory}`) : null;
    if (subcategory && !subcategoryId) throw new Error(`${p.slug}: unknown subcategory "${category}/${subcategory}"`);

    const values = { ...rest, categoryId, subcategoryId: subcategoryId ?? null };
    const { stock: _stock, ...update } = values;
    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({ target: products.slug, set: { ...update, updatedAt: new Date() } });
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${subcategoryIds.size} subcategories, ${MOCK_PRODUCTS.length} products.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
