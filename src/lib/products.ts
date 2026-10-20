import { desc, eq, inArray } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { MOCK_PRODUCTS } from "@/db/mock-products";
import { products } from "@/db/schema";
import type { Product } from "./types";

type Row = typeof products.$inferSelect;

const toProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  subtitle: r.subtitle,
  category: r.category,
  subcategory: r.subcategory,
  gender: r.gender,
  priceKobo: r.priceKobo,
  salePriceKobo: r.salePriceKobo,
  colors: r.colors,
  sizes: r.sizes,
  badge: r.badge,
  description: r.description,
  images: r.images,
  stock: r.stock,
});

// With no DATABASE_URL the storefront runs on the demo catalogue so the UI is usable immediately.

export async function getAllProducts(): Promise<Product[]> {
  if (!hasDb()) return MOCK_PRODUCTS;
  const rows = await getDb().select().from(products).orderBy(desc(products.createdAt));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDb()) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [row] = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  if (!hasDb()) return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  const rows = await getDb().select().from(products).where(inArray(products.id, ids));
  return rows.map(toProduct);
}
