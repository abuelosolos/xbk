/**
 * Concurrency checks for stock handling. WRITES to the database, so it only runs against a
 * disposable Neon branch given as TEST_DATABASE_URL (never DATABASE_URL):
 *   TEST_DATABASE_URL=postgres://... npm run test:stock
 * The branch must already have the migrations applied and be seeded (needs one category).
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error("Set TEST_DATABASE_URL to a disposable Neon branch.");
  if (testUrl === process.env.DATABASE_URL) throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL.");
  process.env.DATABASE_URL = testUrl; // everything below talks to the test branch

  const { eq, sql } = await import("drizzle-orm");
  const { getDb } = await import("../src/db");
  const { categories, orderItems, orders, products, stockMovements } = await import("../src/db/schema");
  const { adjustStockBy } = await import("../src/lib/products");
  const { expireStalePending, markPaidAndDecrement } = await import("../src/lib/orders");

  const db = getDb();
  const tag = `race-${Date.now()}`;
  const email = `${tag}@example.com`; // unique per run, so cleanup never touches real rows
  const [category] = await db.select({ id: categories.id }).from(categories).limit(1);
  if (!category) throw new Error("No categories; run db:seed on the test branch first.");

  const [product] = await db
    .insert(products)
    .values({ slug: tag, name: tag, subtitle: "race", categoryId: category.id, gender: "unisex", priceKobo: 1000, sizes: ["M"], colors: [], stock: 100 })
    .returning({ id: products.id });
  const stockNow = async () => (await db.select({ s: products.stock }).from(products).where(eq(products.id, product.id)))[0].s;
  const movements = () => db.select().from(stockMovements).where(eq(stockMovements.productId, product.id));
  const makeOrder = async (qty: number, n: number, status: "pending" | "failed" = "pending") => {
    const [o] = await db
      .insert(orders)
      .values({ email, status, totalKobo: 1000 * qty, reference: `${tag}-${n}`, shipping: { fullName: "Race", phone: "", address: "", city: "", state: "Lagos" } })
      .returning({ id: orders.id });
    await db.insert(orderItems).values({ orderId: o.id, productId: product.id, name: tag, size: "M", qty, unitPriceKobo: 1000 });
    return o.id;
  };

  const results: [string, boolean][] = [];
  try {
    // 1. concurrent +1/-1 net to zero, each logged
    await Promise.all(Array.from({ length: 50 }, (_, i) => adjustStockBy(product.id, i % 2 ? -1 : 1, { reason: "correction" })));
    results.push(["concurrent +/- adjustments net out", (await stockNow()) === 100]);
    results.push(["every adjustment wrote one movement", (await movements()).length === 50]);

    // 2. bounds
    results.push(["refuses removing more than in stock", (await adjustStockBy(product.id, -101, { reason: "damaged" })) === null && (await stockNow()) === 100]);
    results.push(["refused change writes no movement", (await movements()).length === 50]);

    // 3. double settle moves once, logs once
    const o1 = await makeOrder(3, 1);
    const [a, b] = await Promise.all([markPaidAndDecrement(o1), markPaidAndDecrement(o1)]);
    const sale1 = (await movements()).filter((m) => m.orderId === o1);
    results.push(["double settle moves the order once", [a.moved, b.moved].filter(Boolean).length === 1 && (await stockNow()) === 97 && sale1.length === 1]);

    // 4. admin +10 racing a settle of 2 keeps both effects
    const o2 = await makeOrder(2, 2);
    await Promise.all([adjustStockBy(product.id, 10, { reason: "restock" }), markPaidAndDecrement(o2)]);
    results.push(["admin adjustment and sale both apply", (await stockNow()) === 105]);

    // 5. movement history reconciles with stock
    const total = (await movements()).reduce((n, m) => n + m.delta, 0);
    results.push(["movement deltas add up to stock (less opening 100)", total + 100 === (await stockNow())]);

    // 6. oversell floors at 0, flags the order, records the shortfall
    await adjustStockBy(product.id, -((await stockNow()) - 1), { reason: "correction" });
    const o3 = await makeOrder(4, 3);
    const s = await markPaidAndDecrement(o3);
    const [flag] = await db.select({ f: orders.stockShortfall, st: orders.status }).from(orders).where(eq(orders.id, o3));
    const sale3 = (await movements()).find((m) => m.orderId === o3);
    results.push(["oversell floors at 0, flags order, logs shortfall 3", s.moved && s.shortfall && (await stockNow()) === 0 && flag.f && flag.st === "paid" && sale3?.shortfall === 3 && sale3.stockAfter === 0]);

    // 7. an expired (failed) order still settles when payment is verified
    await adjustStockBy(product.id, 5, { reason: "restock" });
    const o4 = await makeOrder(2, 4, "failed");
    const late = await markPaidAndDecrement(o4);
    results.push(["late payment on a failed order settles", late.moved && (await stockNow()) === 3]);

    // 8. expiry only touches pending orders older than 24h
    const oldPending = await makeOrder(1, 5);
    const freshPending = await makeOrder(1, 6);
    await db.update(orders).set({ createdAt: sql`now() - interval '25 hours'` }).where(eq(orders.id, oldPending));
    await expireStalePending();
    const st = async (id: string) => (await db.select({ s: orders.status }).from(orders).where(eq(orders.id, id)))[0].s;
    results.push(["expiry fails only the stale pending order", (await st(oldPending)) === "failed" && (await st(freshPending)) === "pending" && (await st(o1)) === "paid"]);
  } finally {
    await db.delete(orders).where(eq(orders.email, email)); // cascades order_items
    await db.delete(products).where(eq(products.id, product.id)); // cascades movements
  }

  for (const [name, ok] of results) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (results.some(([, ok]) => !ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
