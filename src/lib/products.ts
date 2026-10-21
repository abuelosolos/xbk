import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/db/mock-products";
import { categories, products, subcategories } from "@/db/schema";
import { previewImages } from "./images";
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
};

const selectProducts = () =>
  getDb()
    .select(columns)
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(subcategories, eq(subcategories.id, products.subcategoryId));

const toProduct = (r: Product): Product => ({
  ...r,
  // no uploaded photos yet: show Unsplash stand-ins until real ones are added
  images: r.images.length ? r.images : previewImages(r.category, r.subcategory),
});

// With no DATABASE_URL the storefront runs on the demo catalogue so the UI is usable immediately.

export async function getAllProducts(): Promise<Product[]> {
  if (!hasDb()) return MOCK_PRODUCTS;
  const rows = await selectProducts().orderBy(desc(products.createdAt));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDb()) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const [row] = await selectProducts().where(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  if (!hasDb()) return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  const rows = await selectProducts().where(inArray(products.id, ids));
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
    subcategories: subs.filter((s) => s.categoryId === c.id).map((s) => ({ slug: s.slug, name: s.name })),
  }));
}
