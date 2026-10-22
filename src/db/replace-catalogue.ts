import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/**
 * Makes the catalogue match `mock-products.ts` exactly: upserts those products, then removes every
 * other product (deleted when never ordered, archived when it appears in orders).
 * Dry run unless `--apply` is passed. Try it on a Neon branch first.
 */
async function main() {
  const apply = process.argv.includes("--apply");
  const { getDb } = await import("./index");
  const { products, orderItems } = await import("./schema");
  const { MOCK_PRODUCTS } = await import("./mock-products");
  const { inArray, isNull, notInArray, and } = await import("drizzle-orm");

  const db = getDb();
  const keep = MOCK_PRODUCTS.map((p) => p.slug);

  const old = await db
    .select({ id: products.id, slug: products.slug })
    .from(products)
    .where(and(notInArray(products.slug, keep), isNull(products.archivedAt)));
  const oldIds = old.map((p) => p.id);
  const ordered = oldIds.length
    ? await db.selectDistinct({ id: orderItems.productId }).from(orderItems).where(inArray(orderItems.productId, oldIds))
    : [];
  const orderedIds = new Set(ordered.map((o) => o.id));
  const toArchive = old.filter((p) => orderedIds.has(p.id));
  const toDelete = old.filter((p) => !orderedIds.has(p.id));

  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${MOCK_PRODUCTS.length} products to upsert`);
  console.log(`  delete (${toDelete.length}): ${toDelete.map((p) => p.slug).join(", ") || "-"}`);
  console.log(`  archive, used in orders (${toArchive.length}): ${toArchive.map((p) => p.slug).join(", ") || "-"}`);
  if (!apply) return console.log("Nothing written. Re-run with --apply.");

  // Upserts categories, sub-categories and the new products (stock of existing rows is kept).
  const { seedCatalogue } = await import("./seed-catalogue");
  await seedCatalogue();

  if (toArchive.length) {
    await db
      .update(products)
      .set({ archivedAt: new Date() })
      .where(inArray(products.id, toArchive.map((p) => p.id)));
  }
  if (toDelete.length) {
    await db.delete(products).where(inArray(products.id, toDelete.map((p) => p.id)));
  }
  console.log("Done. Old photos on Blob (if any) are not removed. Redeploy or edit a product to refresh cached pages.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
