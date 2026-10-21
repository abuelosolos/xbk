"use server";

import { z } from "zod";
import { adjustStockBy, getProductStock } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { stockAdjustSchema } from "@/lib/stock";
import { revalidatePath } from "next/cache";

export type StockState = { ok?: boolean; error?: string; stock?: number };

/** Adds or removes stock. A signed delta, never an absolute "set", so it composes with sales settling at the same moment. */
export async function adjustStock(id: string, _prev: StockState, formData: FormData): Promise<StockState> {
  const { user } = await requireAdmin("/admin/inventory");
  if (!z.string().uuid().safeParse(id).success) return { error: "Product not found." };

  const parsed = stockAdjustSchema.safeParse({
    sign: formData.get("sign"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    note: String(formData.get("note") ?? "") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the details." };

  const { sign, amount, reason, note } = parsed.data;
  const delta = sign === "-" ? -amount : amount;
  const row = await adjustStockBy(id, delta, { reason, actorId: user.id, note: note ?? null });
  if (!row) {
    const current = await getProductStock(id);
    if (current === null) return { error: "Product not found." };
    return { error: delta < 0 ? `Only ${current} in stock; can't remove ${amount}.` : "That would exceed the maximum stock." };
  }

  revalidatePath(`/product/${row.slug}`);
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/[hub]", "page");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { ok: true, stock: row.stock };
}
