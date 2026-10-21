"use server";

import { and, eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, products, subcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { nairaToKobo } from "@/lib/utils";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Uploads the form's photo files to Vercel Blob and returns their public URLs. */
async function uploadPhotos(files: FormDataEntryValue[], slug: string) {
  const photos = files.filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length === 0) return [];
  if (photos.length > MAX_PHOTOS) throw new Error(`Upload at most ${MAX_PHOTOS} photos`);
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  for (const f of photos) {
    if (!PHOTO_TYPES.has(f.type)) throw new Error(`${f.name}: use a JPEG, PNG or WebP image`);
    if (f.size > MAX_PHOTO_BYTES) throw new Error(`${f.name}: must be under 5 MB`);
  }
  const ext = (t: string) => (t === "image/png" ? "png" : t === "image/webp" ? "webp" : "jpg");
  const blobs = await Promise.all(
    photos.map((f, i) => put(`products/${slug}/${i + 1}.${ext(f.type)}`, f, { access: "public", addRandomSuffix: true })),
  );
  return blobs.map((b) => b.url);
}

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

const naira = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount in naira with at most 2 decimals")
  .transform(nairaToKobo)
  .refine((kobo) => kobo > 0, "Must be more than zero");

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-with-dashes"),
  subtitle: z.string().trim().min(2),
  category: z.string().trim().min(1), // category slug, picked from the form's dropdown
  subcategory: z.string().trim().optional(), // sub-category slug within that category
  gender: z.enum(["men", "women", "kids", "unisex"]),
  priceNaira: naira,
  saleNaira: naira.optional(),
  sizes: z.string().transform(csv),
  colors: z.string().transform(csv), // "Black:#111111, White:#ffffff"
  stock: z.coerce.number().int().min(0),
  badge: z.string().trim().optional(),
  description: z.string().trim().default(""),
}).refine((v) => v.saleNaira === undefined || v.saleNaira < v.priceNaira, {
  message: "Sale price must be below the price",
  path: ["saleNaira"],
});

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  if (raw.saleNaira === "") delete raw.saleNaira;
  delete raw.photos; // files are read separately below
  const input = schema.parse(raw);
  const images = await uploadPhotos(formData.getAll("photos"), input.slug);

  const db = getDb();
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.category)).limit(1);
  if (!category) throw new Error(`Unknown category "${input.category}"`);

  let subcategoryId: string | null = null;
  if (input.subcategory) {
    const [sub] = await db
      .select({ id: subcategories.id })
      .from(subcategories)
      .where(and(eq(subcategories.categoryId, category.id), eq(subcategories.slug, input.subcategory)))
      .limit(1);
    if (!sub) throw new Error(`"${input.subcategory}" is not a sub-category of "${input.category}"`);
    subcategoryId = sub.id;
  }

  await db.insert(products).values({
    name: input.name,
    slug: input.slug,
    subtitle: input.subtitle,
    categoryId: category.id,
    subcategoryId,
    gender: input.gender,
    priceKobo: input.priceNaira,
    salePriceKobo: input.saleNaira ?? null,
    sizes: input.sizes,
    colors: input.colors.map((c) => {
      const [name, hex] = c.split(":").map((s) => s.trim());
      return { name, hex: hex || "#111111" };
    }),
    stock: input.stock,
    badge: input.badge || null,
    description: input.description,
    images,
  });

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/[hub]", "page");
  revalidatePath("/admin/products");
}
