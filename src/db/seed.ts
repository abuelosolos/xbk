import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  // Imported after env is loaded so DATABASE_URL is available.
  const { getDb } = await import("./index");
  const { products } = await import("./schema");
  const { MOCK_PRODUCTS } = await import("./mock-products");

  const db = getDb();
  for (const p of MOCK_PRODUCTS) {
    const { id: _id, ...values } = p;
    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({ target: products.slug, set: values });
  }
  console.log(`Seeded ${MOCK_PRODUCTS.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
