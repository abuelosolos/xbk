"use server";

import { del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, orderItems, products, stockMovements, subcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { MAX_PHOTOS, uploadPhotos } from "@/lib/uploads";
import { fieldErrors } from "@/lib/validation";
import { productSchema, productUpdateSchema } from "./schema";

export type ProductFormState = {
  ok?: boolean;
  errors?: Record<string, string>;
  /** what was submitted, so the form can keep it after a rejected save */
  values?: Record<string, string>;
};

const uuid = z.string().uuid();

type Input = Omit<z.infer<typeof productSchema>, "stock">;
type Fail = { errors: Record<string, string> };

/** Resolves the category/sub-category slugs to ids, or returns the form error. */
async function resolveCategory(input: Input): Promise<{ categoryId: string; subcategoryId: string | null } | Fail> {
  const db = getDb();
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.category)).limit(1);
  if (!category) return { errors: { category: `Unknown category "${input.category}".` } };
  if (!input.subcategory) return { categoryId: category.id, subcategoryId: null };
  const [sub] = await db
    .select({ id: subcategories.id })
    .from(subcategories)
    .where(and(eq(subcategories.categoryId, category.id), eq(subcategories.slug, input.subcategory)))
    .limit(1);
  if (!sub) return { errors: { category: `"${input.subcategory}" is not a sub-category of "${input.category}".` } };
  return { categoryId: category.id, subcategoryId: sub.id };
}

const toRow = (input: Input, ids: { categoryId: string; subcategoryId: string | null }) => ({
  name: input.name,
  slug: input.slug,
  subtitle: input.subtitle,
  categoryId: ids.categoryId,
  subcategoryId: ids.subcategoryId,
  gender: input.gender,
  priceKobo: input.priceNaira,
  salePriceKobo: input.saleNaira ?? null,
  sizes: input.sizes,
  colors: input.colors.map((c) => {
    const [name, hex] = c.split(":").map((s) => s.trim());
    return { name, hex: hex || "#111111" };
  }),
  badge: input.badge || null,
  description: input.description,
});

function parseForm<S extends typeof productSchema | typeof productUpdateSchema>(formData: FormData, schema: S) {
  const raw = Object.fromEntries(formData);
  const values = Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  if (raw.saleNaira === "") delete raw.saleNaira;
  delete raw.photos; // files are read separately
  delete raw.keep;
  return { values, parsed: schema.safeParse(raw) as ReturnType<S["safeParse"]> };
}

function revalidateCatalogue(slug: string) {
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/[hub]", "page");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/products");
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const { user } = await requireAdmin("/admin/products/new");

  const { values, parsed } = parseForm(formData, productSchema);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const input = parsed.data;

  const db = getDb();
  const [taken] = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1);
  if (taken) return { errors: { slug: "That slug is already used by another product." }, values };

  const ids = await resolveCategory(input);
  if ("errors" in ids) return { errors: ids.errors, values };

  let images: string[];
  try {
    images = await uploadPhotos(formData.getAll("photos"), input.slug);
  } catch (err) {
    return { errors: { photos: err instanceof Error ? err.message : "Couldn't upload the photos." }, values };
  }

  // product + its opening-stock movement succeed or fail together (batch = one implicit transaction)
  const id = randomUUID();
  await db.batch([
    db.insert(products).values({ id, ...toRow(input, ids), stock: input.stock, images }),
    db.insert(stockMovements).values({ productId: id, delta: input.stock, stockAfter: input.stock, reason: "initial", actorUserId: user.id }),
  ]);
  revalidateCatalogue(input.slug);
  return { ok: true };
}

export async function updateProduct(id: string, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin(`/admin/products/${id}/edit`);
  if (!uuid.safeParse(id).success) return { errors: { name: "This product no longer exists." } };

  const { values, parsed } = parseForm(formData, productUpdateSchema);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const input = parsed.data;

  const db = getDb();
  const [current] = await db.select({ slug: products.slug, images: products.images }).from(products).where(eq(products.id, id)).limit(1);
  if (!current) return { errors: { name: "This product no longer exists." }, values };

  const [taken] = await db.select({ id: products.id }).from(products).where(and(eq(products.slug, input.slug), ne(products.id, id))).limit(1);
  if (taken) return { errors: { slug: "That slug is already used by another product." }, values };

  const ids = await resolveCategory(input);
  if ("errors" in ids) return { errors: ids.errors, values };

  // Only photos this product already has can be kept; anything else submitted is ignored.
  const kept = formData.getAll("keep").filter((u): u is string => typeof u === "string" && current.images.includes(u));
  let added: string[];
  try {
    added = await uploadPhotos(formData.getAll("photos"), input.slug);
  } catch (err) {
    return { errors: { photos: err instanceof Error ? err.message : "Couldn't upload the photos." }, values };
  }
  if (kept.length + added.length > MAX_PHOTOS) return { errors: { photos: `A product can have at most ${MAX_PHOTOS} photos.` }, values };

  await db
    .update(products)
    .set({ ...toRow(input, ids), images: [...kept, ...added], updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidateCatalogue(input.slug);
  if (current.slug !== input.slug) revalidatePath(`/product/${current.slug}`);
  return { ok: true };
}

export type ProductActionState = { ok?: boolean; error?: string };

/** Hides a product from the storefront and checkout; orders and photos are untouched. */
export async function archiveProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin("/admin/products");
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { error: "Product not found." };
  const [row] = await getDb().update(products).set({ archivedAt: new Date() }).where(eq(products.id, id.data)).returning({ slug: products.slug });
  if (!row) return { error: "Product not found." };
  revalidateCatalogue(row.slug);
  return { ok: true };
}

export async function restoreProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin("/admin/products");
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { error: "Product not found." };
  const [row] = await getDb().update(products).set({ archivedAt: null }).where(eq(products.id, id.data)).returning({ slug: products.slug });
  if (!row) return { error: "Product not found." };
  revalidateCatalogue(row.slug);
  return { ok: true };
}

/** Permanent. Only for products that no order has ever contained; everything else should be archived. */
export async function deleteProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin("/admin/products");
  const parsed = uuid.safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Product not found." };
  const id = parsed.data;
  const db = getDb();

  const [product] = await db.select({ slug: products.slug, images: products.images }).from(products).where(eq(products.id, id)).limit(1);
  if (!product) return { error: "Product not found." };
  const [ordered] = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, id)).limit(1);
  if (ordered) return { error: "This product appears in orders, so it can only be archived." };

  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (err) {
    // 23503 = an order referenced it between the check above and the delete
    if ((err as { code?: string; cause?: { code?: string } })?.code === "23503" || (err as { cause?: { code?: string } })?.cause?.code === "23503") {
      return { error: "This product appears in orders, so it can only be archived." };
    }
    console.error("Deleting product failed", err);
    return { error: "Couldn't delete the product." };
  }

  // The row is gone; a photo clean-up failure must not turn that into an error.
  const blobs = product.images.filter((u) => u.includes("blob.vercel-storage.com"));
  if (blobs.length && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(blobs);
    } catch (err) {
      console.error("Deleting product photos failed", err);
    }
  }
  revalidateCatalogue(product.slug);
  return { ok: true };
}
