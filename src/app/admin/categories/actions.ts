"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { revalidateCatalogue } from "@/lib/revalidate";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, products, subcategories } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export type CategoryState = { ok?: boolean; error?: string };

const name = z.string().trim().min(2, "Enter a name.").max(60);
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers and dashes.");
const order = z.coerce.number({ invalid_type_error: "Order must be a whole number." }).int("Order must be a whole number.").min(0).max(10_000);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const fail = (e: z.ZodError): CategoryState => ({ error: e.issues[0]?.message ?? "Check the details." });

function refresh() {
  revalidatePath("/admin/categories");
  revalidateCatalogue();
}

const PATH = "/admin/categories";

export async function createCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ name, slug, sortOrder: order }).safeParse({
    name: formData.get("name"),
    slug: String(formData.get("slug") || "").trim() || slugify(String(formData.get("name") ?? "")),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!p.success) return fail(p.error);
  const db = getDb();
  const [dup] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, p.data.slug)).limit(1);
  if (dup) return { error: "That slug is already used by another category." };
  await db.insert(categories).values(p.data);
  refresh();
  return { ok: true };
}

export async function updateCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ slug, name, sortOrder: order }).safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const rows = await getDb().update(categories).set({ name: p.data.name, sortOrder: p.data.sortOrder }).where(eq(categories.slug, p.data.slug)).returning({ id: categories.id });
  if (!rows.length) return { error: "Category not found." };
  refresh();
  return { ok: true };
}

export async function deleteCategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ slug }).safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const db = getDb();
  const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, p.data.slug)).limit(1);
  if (!cat) return { error: "Category not found." };
  const [used] = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, cat.id)).limit(1);
  if (used) return { error: "Products still use this category. Move them first." };
  const [sub] = await db.select({ id: subcategories.id }).from(subcategories).where(eq(subcategories.categoryId, cat.id)).limit(1);
  if (sub) return { error: "Delete its sub-categories first." };
  await db.delete(categories).where(eq(categories.id, cat.id));
  refresh();
  return { ok: true };
}

export async function createSubcategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ category: slug, name, slug, sortOrder: order }).safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    slug: String(formData.get("slug") || "").trim() || slugify(String(formData.get("name") ?? "")),
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!p.success) return fail(p.error);
  const db = getDb();
  const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, p.data.category)).limit(1);
  if (!cat) return { error: "Category not found." };
  const [dup] = await db.select({ id: subcategories.id }).from(subcategories).where(and(eq(subcategories.categoryId, cat.id), eq(subcategories.slug, p.data.slug))).limit(1);
  if (dup) return { error: "That slug is already used in this category." };
  await db.insert(subcategories).values({ categoryId: cat.id, name: p.data.name, slug: p.data.slug, sortOrder: p.data.sortOrder });
  refresh();
  return { ok: true };
}

async function findSub(categorySlug: string, subSlug: string) {
  const [row] = await getDb()
    .select({ id: subcategories.id })
    .from(subcategories)
    .innerJoin(categories, eq(categories.id, subcategories.categoryId))
    .where(and(eq(categories.slug, categorySlug), eq(subcategories.slug, subSlug)))
    .limit(1);
  return row;
}

export async function updateSubcategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ category: slug, slug, name, sortOrder: order }).safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const sub = await findSub(p.data.category, p.data.slug);
  if (!sub) return { error: "Sub-category not found." };
  await getDb().update(subcategories).set({ name: p.data.name, sortOrder: p.data.sortOrder }).where(eq(subcategories.id, sub.id));
  refresh();
  return { ok: true };
}

export async function deleteSubcategory(_prev: CategoryState, formData: FormData): Promise<CategoryState> {
  await requireAdmin(PATH);
  const p = z.object({ category: slug, slug }).safeParse(Object.fromEntries(formData));
  if (!p.success) return fail(p.error);
  const sub = await findSub(p.data.category, p.data.slug);
  if (!sub) return { error: "Sub-category not found." };
  const [used] = await getDb().select({ id: products.id }).from(products).where(eq(products.subcategoryId, sub.id)).limit(1);
  if (used) return { error: "Products still use this sub-category. Move them first." };
  await getDb().delete(subcategories).where(eq(subcategories.id, sub.id));
  refresh();
  return { ok: true };
}
