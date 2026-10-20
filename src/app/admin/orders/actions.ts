"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export async function markShipped(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await getDb()
    .update(orders)
    .set({ status: "shipped" })
    .where(and(eq(orders.id, id), eq(orders.status, "paid")));
  revalidatePath("/admin/orders");
}
