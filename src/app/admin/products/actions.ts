"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase-with-dashes"),
  subtitle: z.string().trim().min(2),
  category: z.string().trim().toLowerCase().min(2),
  gender: z.enum(["men", "women", "kids", "unisex"]),
  priceNaira: z.coerce.number().positive(),
  saleNaira: z.coerce.number().positive().optional(),
  sizes: z.string().transform(csv),
  colors: z.string().transform(csv), // "Black:#111111, White:#ffffff"
  stock: z.coerce.number().int().min(0),
  badge: z.string().trim().optional(),
  description: z.string().trim().default(""),
});

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  if (raw.saleNaira === "") delete raw.saleNaira;
  const input = schema.parse(raw);

  await getDb().insert(products).values({
    name: input.name,
    slug: input.slug,
    subtitle: input.subtitle,
    category: input.category,
    gender: input.gender,
    priceKobo: Math.round(input.priceNaira * 100),
    salePriceKobo: input.saleNaira ? Math.round(input.saleNaira * 100) : null,
    sizes: input.sizes,
    colors: input.colors.map((c) => {
      const [name, hex] = c.split(":").map((s) => s.trim());
      return { name, hex: hex || "#111111" };
    }),
    stock: input.stock,
    badge: input.badge || null,
    description: input.description,
  });

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");
}
