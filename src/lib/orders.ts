import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { sendOrderEmails } from "./email";
import { verifyTransaction } from "./paystack";

export type SettleResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not_found" | "failed" | "pending" | "amount_mismatch" };

/**
 * Idempotent: safe to call from both the Paystack webhook and the success page.
 * Always re-verifies with Paystack and checks the amount against our own order total.
 */
export async function settleOrderByReference(reference: string): Promise<SettleResult> {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.reference, reference)).limit(1);
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "paid" || order.status === "shipped") return { ok: true, orderId: order.id };

  const tx = await verifyTransaction(reference);

  if (tx.status === "success") {
    if (tx.amount !== order.totalKobo || tx.currency !== "NGN") {
      return { ok: false, reason: "amount_mismatch" };
    }
    const moved = await db
      .update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
      .returning({ id: orders.id });

    // Only the call that flipped pending → paid decrements stock.
    if (moved.length) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const item of items) {
        await db
          .update(products)
          .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` })
          .where(eq(products.id, item.productId));
      }
      await sendOrderEmails({ ...order, items });
    }
    return { ok: true, orderId: order.id };
  }

  if (tx.status === "failed") {
    await db
      .update(orders)
      .set({ status: "failed" })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")));
    return { ok: false, reason: "failed" };
  }

  return { ok: false, reason: "pending" };
}
