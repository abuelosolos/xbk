"use server";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidateCatalogue } from "@/lib/revalidate";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, orderItems, products, stockMovements, subcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { withColorPhotos } from "@/lib/colors";
import { MAX_PHOTOS, deleteBlobs, parsePhotoUrls } from "@/lib/uploads";
import { scaleKobo } from "@/lib/pricing";
import { adjustStockBy } from "@/lib/products";
import { MAX_STOCK } from "@/lib/stock";
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

/** Photo URL -> colour name, from the form's parallel `photo` / `photoColor` lists ("" = not tied to a colour). */
function photoColorTags(formData: FormData) {
  const urls = formData.getAll("photo");
  const names = formData.getAll("photoColor");
  const tags = new Map<string, string>();
  urls.forEach((url, i) => {
    const name = names[i];
    if (typeof url === "string" && typeof name === "string" && name) tags.set(url, name);
  });
  return tags;
}

const toRow = (input: Input, ids: { categoryId: string; subcategoryId: string | null }, images: string[], tags: Map<string, string>) => ({
  name: input.name,
  slug: input.slug,
  subtitle: input.subtitle,
  categoryId: ids.categoryId,
  subcategoryId: ids.subcategoryId,
  gender: input.gender,
  priceKobo: input.priceNaira,
  salePriceKobo: input.saleNaira ?? null,
  sizes: input.sizes,
  colors: withColorPhotos(
    input.colors.map((c) => {
      const [name, hex] = c.split(":").map((s) => s.trim());
      return { name, hex: hex || "#111111" };
    }),
    images,
    tags,
  ),
  badge: input.badge || null,
  description: input.description,
});

function parseForm<S extends typeof productSchema | typeof productUpdateSchema>(formData: FormData, schema: S) {
  const raw = Object.fromEntries(formData);
  const values = Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  if (raw.saleNaira === "") delete raw.saleNaira;
  delete raw.photo; // photo URLs (and their colours) are read separately
  delete raw.photoColor;
  return { values, parsed: schema.safeParse(raw) as ReturnType<S["safeParse"]> };
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

  const images = parsePhotoUrls(formData.getAll("photo"));
  if (images.length > MAX_PHOTOS) return { errors: { photos: `A product can have at most ${MAX_PHOTOS} photos.` }, values };

  // product + its opening-stock movement succeed or fail together (batch = one implicit transaction)
  const id = randomUUID();
  await db.batch([
    db.insert(products).values({ id, ...toRow(input, ids, images, photoColorTags(formData)), stock: input.stock, images }),
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

  const images = parsePhotoUrls(formData.getAll("photo"), current.images);
  if (images.length > MAX_PHOTOS) return { errors: { photos: `A product can have at most ${MAX_PHOTOS} photos.` }, values };

  await db
    .update(products)
    .set({ ...toRow(input, ids, images, photoColorTags(formData)), images, updatedAt: new Date() })
    .where(eq(products.id, id));
  await deleteBlobs(current.images.filter((u) => !images.includes(u))); // photos removed in this edit
  revalidateCatalogue([input.slug, current.slug]);
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
  await deleteBlobs(product.images);
  revalidateCatalogue(product.slug);
  return { ok: true };
}

export type BulkState = { ok?: boolean; error?: string; message?: string };

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Select at least one product.").max(200, "Select at most 200 products."),
  percent: z.string().trim().regex(/^-?\d{1,3}(\.\d{1,2})?$/, "Enter a percentage like -10 or 5.5.").optional(),
  addStock: z.string().trim().regex(/^\d+$/, "Stock to add must be a whole number.").optional(),
});

/** Price change by a percentage (sale prices move with it) and/or stock added to every selected product. */
export async function bulkEditProducts(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const { user } = await requireAdmin("/admin/products");
  const parsed = bulkSchema.safeParse({
    ids: formData.getAll("ids"),
    percent: String(formData.get("percent") ?? "") || undefined,
    addStock: String(formData.get("addStock") ?? "") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details." };
  const { ids, percent, addStock } = parsed.data;
  if (percent === undefined && addStock === undefined) return { error: "Enter a price change, stock to add, or both." };
  const add = addStock === undefined ? 0 : Number(addStock);
  if (addStock !== undefined && (add < 1 || add > MAX_STOCK)) return { error: "Stock to add must be between 1 and 1,000,000." };

  const db = getDb();
  const rows = await db
    .select({ id: products.id, name: products.name, slug: products.slug, price: products.priceKobo, sale: products.salePriceKobo })
    .from(products)
    .where(inArray(products.id, ids));
  if (rows.length === 0) return { error: "Those products no longer exist." };

  if (percent !== undefined) {
    const pct = Number(percent);
    if (pct < -90 || pct > 500) return { error: "Choose a percentage between -90 and 500." };
    const updates = [];
    for (const r of rows) {
      const price = scaleKobo(r.price, pct);
      const sale = r.sale === null ? null : scaleKobo(r.sale, pct);
      if (price === null || (r.sale !== null && sale === null)) return { error: `${r.name}: that change would make the price invalid. Nothing was changed.` };
      updates.push(db.update(products).set({ priceKobo: price, salePriceKobo: sale, updatedAt: new Date() }).where(eq(products.id, r.id)));
    }
    await db.batch(updates as [(typeof updates)[number], ...(typeof updates)[number][]]); // all or nothing
  }

  let skipped = 0;
  if (add > 0) {
    for (const r of rows) {
      if (!(await adjustStockBy(r.id, add, { reason: "restock", actorId: user.id, note: "Bulk restock" }))) skipped++;
    }
  }

  revalidateCatalogue(rows.map((r) => r.slug));
  const parts = [percent !== undefined && `price ${Number(percent) > 0 ? "+" : ""}${Number(percent)}%`, add > 0 && `+${add} stock`].filter(Boolean).join(", ");
  return { ok: true, message: `Updated ${rows.length} product${rows.length === 1 ? "" : "s"} (${parts}).${skipped ? ` ${skipped} stock change${skipped === 1 ? "" : "s"} skipped (over the maximum).` : ""}` };
}
