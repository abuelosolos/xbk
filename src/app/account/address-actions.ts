"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { addresses } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { fieldErrors, shippingSchema } from "@/lib/validation";

type Result = { error?: string; errors?: Record<string, string> };

const parse = (data: unknown) => {
  const r = shippingSchema.safeParse(data);
  return r.success ? { value: r.data } : { errors: fieldErrors(r.error) };
};

/** The first address a user saves becomes their default. */
export async function addAddress(data: unknown): Promise<Result> {
  const { user } = await requireUser("/account");
  const p = parse(data);
  if (!p.value) return { errors: p.errors };
  const db = getDb();
  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, user.id)).limit(1);
  await db.insert(addresses).values({ ...p.value, userId: user.id, isDefault: existing.length === 0 });
  revalidatePath("/account");
  return {};
}

export async function updateAddress(id: string, data: unknown): Promise<Result> {
  const { user } = await requireUser("/account");
  const p = parse(data);
  if (!p.value) return { errors: p.errors };
  await getDb()
    .update(addresses)
    .set(p.value)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath("/account");
  return {};
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const { user } = await requireUser("/account");
  const db = getDb();
  // clear first: the partial unique index allows only one default per user
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db
    .update(addresses)
    .set({ isDefault: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath("/account");
  return {};
}

export async function deleteAddress(id: string): Promise<Result> {
  const { user } = await requireUser("/account");
  const db = getDb();
  const [gone] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .returning({ wasDefault: addresses.isDefault });
  if (gone?.wasDefault) {
    // promote the oldest remaining address
    const [next] = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, user.id)).orderBy(addresses.createdAt).limit(1);
    if (next) await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, next.id));
  }
  revalidatePath("/account");
  return {};
}
