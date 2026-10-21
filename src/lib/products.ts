import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/db/mock-products";
import { categories, orders, products, stockMovements, subcategories, user as userTable } from "@/db/schema";
import { previewImages } from "./images";
import { MAX_STOCK } from "./stock";
import type { Category, Product } from "./types";

// Products are always read joined to their category and (optional) sub-category so the storefront keeps
// working with plain slugs: `category: "footwear"`, `subcategory: "running"`.
const columns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  subtitle: products.subtitle,
  category: categories.slug,
  subcategory: subcategories.slug,
  gender: products.gender,
  priceKobo: products.priceKobo,
  salePriceKobo: products.salePriceKobo,
  colors: products.colors,
  sizes: products.sizes,
  badge: products.badge,
  description: products.description,
  images: products.images,
  stock: products.stock,
  archived: sql<boolean>`${products.archivedAt} is not null`,
};

type Opts = { includeArchived?: boolean };

/** Archived products are excluded unless a caller (admin, order history) asks for them. */
const selectProducts = (where?: SQL, { includeArchived = false }: Opts = {}) =>
  getDb()
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(subcategories, eq(subcategories.id, products.subcategoryId))
    .where(includeArchived ? where : and(where, isNull(products.archivedAt)));

const toProduct = (r: Product): Product => ({
  ...r,
  // no uploaded photos yet: show Unsplash stand-ins until real ones are added
  images: r.images.length ? r.images : previewImages(r.category, r.subcategory),
});

// With no DATABASE_URL the storefront runs on the demo catalogue so the UI is usable immediately.

export async function getAllProducts(opts: Opts = {}): Promise<Product[]> {
  if (!hasDb()) return MOCK_PRODUCTS;
  const rows = await selectProducts(undefined, opts).orderBy(desc(products.createdAt));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDb()) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [row] = await selectProducts(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : null;
}

/** Admin edit form: raw stored values (no stand-in preview images). */
export async function getProductById(id: string): Promise<Product | null> {
  if (!hasDb()) return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  const [row] = await selectProducts(eq(products.id, id), { includeArchived: true }).limit(1);
  return row ?? null;
}

export async function getProductsByIds(ids: string[], opts: Opts = {}): Promise<Product[]> {
  if (!ids.length) return [];
  if (!hasDb()) return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  const rows = await selectProducts(inArray(products.id, ids), opts);
  return rows.map(toProduct);
}

/** Every category with its sub-categories, in display order. */
export async function getCategories(): Promise<Category[]> {
  if (!hasDb()) return MOCK_CATEGORIES;
  const db = getDb();
  const [cats, subs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(subcategories).orderBy(asc(subcategories.sortOrder), asc(subcategories.name)),
  ]);
  return cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
    subcategories: subs.filter((s) => s.categoryId === c.id).map((s) => ({ slug: s.slug, name: s.name, sortOrder: s.sortOrder })),
  }));
}

export { MAX_STOCK };

export type StockChange = { reason: "restock" | "correction" | "damaged" | "return"; actorId?: string | null; note?: string | null };

/**
 * Atomic `stock + delta` plus its movement-log row in ONE statement (the HTTP driver has no
 * transactions). Refused (null) if the result would leave 0..MAX_STOCK or the product is missing.
 */
export async function adjustStockBy(id: string, delta: number, change: StockChange = { reason: "correction" }): Promise<{ slug: string; stock: number } | null> {
  const result = await getDb().execute<{ slug: string; stock: number }>(sql`
    WITH upd AS (
      UPDATE products
      SET stock = stock + ${delta}::int, updated_at = now()
      WHERE id = ${id}::uuid AND stock + ${delta}::int BETWEEN 0 AND ${MAX_STOCK}::int
      RETURNING id, slug, stock
    ),
    log AS (
      INSERT INTO stock_movements (product_id, delta, stock_after, reason, actor_user_id, note)
      SELECT id, ${delta}::int, stock, ${change.reason}, ${change.actorId ?? null}, ${change.note ?? null} FROM upd
    )
    SELECT slug, stock FROM upd
  `);
  return result.rows[0] ?? null;
}

export async function getProductStock(id: string): Promise<number | null> {
  const [row] = await getDb().select({ stock: products.stock }).from(products).where(eq(products.id, id)).limit(1);
  return row?.stock ?? null;
}

/** Every product (archived included) with its stock, lowest first, for the inventory screen. */
export async function getInventory(): Promise<Product[]> {
  const rows = await selectProducts(undefined, { includeArchived: true }).orderBy(asc(products.stock), asc(products.name));
  return rows;
}

/** Recent stock movements for one product, newest first. */
export async function getStockMovements(productId: string, limit = 100) {
  return getDb()
    .select({
      id: stockMovements.id,
      delta: stockMovements.delta,
      shortfall: stockMovements.shortfall,
      stockAfter: stockMovements.stockAfter,
      reason: stockMovements.reason,
      note: stockMovements.note,
      createdAt: stockMovements.createdAt,
      orderId: stockMovements.orderId,
      orderReference: orders.reference,
      actorName: userTable.name,
    })
    .from(stockMovements)
    .leftJoin(orders, eq(orders.id, stockMovements.orderId))
    .leftJoin(userTable, eq(userTable.id, stockMovements.actorUserId))
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit);
}

/** Orders paid while stock could not cover them, newest first. */
export async function getOversoldOrders(limit = 20) {
  return getDb()
    .select({ id: orders.id, reference: orders.reference, createdAt: orders.createdAt, email: orders.email })
    .from(orders)
    .where(eq(orders.stockShortfall, true))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
