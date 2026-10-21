import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { sendOrderEmails } from "./email";
import { verifyTransaction } from "./paystack";

export type SettleResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not_found" | "failed" | "pending" | "amount_mismatch" };

/**
 * Flips pending/failed → paid, flags a shortfall, decrements stock and writes one `sale` movement per
 * product in ONE statement (the HTTP driver has no transactions). A concurrent second call waits on the
 * order row, matches nothing and changes nothing; a crash can't leave a paid order without its decrement.
 * `failed` is accepted because a verified Paystack payment is authoritative (e.g. a late payment on an
 * order that expired).
 */
export async function markPaidAndDecrement(orderId: string) {
  const result = await getDb().execute<{ moved: number; shortfall: boolean | null; slugs: string[] | string | null }>(sql`
    WITH needed AS (
      SELECT product_id, sum(qty)::int AS qty FROM order_items WHERE order_id = ${orderId}::uuid GROUP BY product_id
    ),
    snap AS (
      SELECT p.id, p.stock AS old, n.qty FROM products p JOIN needed n ON n.product_id = p.id
    ),
    paid_order AS (
      UPDATE orders
      SET status = 'paid',
          paid_at = now(),
          stock_shortfall = EXISTS (SELECT 1 FROM snap WHERE old < qty)
      WHERE id = ${orderId}::uuid AND status IN ('pending', 'failed')
      RETURNING stock_shortfall
    ),
    dec_stock AS (
      UPDATE products p
      SET stock = greatest(p.stock - s.qty, 0)
      FROM snap s
      WHERE p.id = s.id AND EXISTS (SELECT 1 FROM paid_order)
      RETURNING p.slug
    ),
    mv AS (
      INSERT INTO stock_movements (product_id, delta, shortfall, stock_after, reason, order_id)
      SELECT s.id, -least(s.old, s.qty), greatest(s.qty - s.old, 0), greatest(s.old - s.qty, 0), 'sale', ${orderId}::uuid
      FROM snap s
      WHERE EXISTS (SELECT 1 FROM paid_order)
    )
    SELECT (SELECT count(*) FROM paid_order)::int AS moved,
           (SELECT stock_shortfall FROM paid_order) AS shortfall,
           coalesce((SELECT json_agg(slug) FROM dec_stock), '[]'::json) AS slugs
  `);
  const row = result.rows[0];
  const slugs = typeof row?.slugs === "string" ? (JSON.parse(row.slugs) as string[]) : (row?.slugs ?? []);
  return { moved: (row?.moved ?? 0) > 0, shortfall: Boolean(row?.shortfall), slugs };
}

/** Customers can still pay these later (see markPaidAndDecrement); expiring only tidies stale checkouts. No stock is held by pending orders. */
export const PENDING_ORDER_TTL_HOURS = 24;

export async function expireStalePending() {
  try {
    await getDb().execute(sql`
      UPDATE orders SET status = 'failed'
      WHERE status = 'pending' AND created_at < now() - make_interval(hours => ${PENDING_ORDER_TTL_HOURS}::int)
    `);
  } catch (err) {
    console.error("Expiring stale orders failed", err);
  }
}

/**
 * Sales change stock, so cached storefront pages must refresh. Not allowed while a Server Component is
 * rendering (the success page), so a failure here is ignored: the webhook path does the refresh.
 */
function refreshStorefront(slugs: string[]) {
  try {
    for (const slug of slugs) revalidatePath(`/product/${slug}`);
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/[hub]", "page");
    revalidatePath("/admin/inventory");
  } catch {
    /* rendering context */
  }
}

/**
 * Idempotent: safe to call from both the Paystack webhook and the success page.
 * Always re-verifies with Paystack and checks the amount against our own order total.
 */
export async function settleOrderByReference(reference: string): Promise<SettleResult> {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.reference, reference)).limit(1);
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") return { ok: true, orderId: order.id };

  const tx = await verifyTransaction(reference);

  if (tx.status === "success") {
    if (tx.amount !== order.totalKobo || tx.currency !== "NGN") {
      return { ok: false, reason: "amount_mismatch" };
    }
    const { moved, shortfall, slugs } = await markPaidAndDecrement(order.id);

    // Only the call that flipped pending → paid emails the customer.
    if (moved) {
      refreshStorefront(slugs);
      if (shortfall) console.error(`Order ${reference} was paid but stock did not cover it; check stock and contact the customer.`);
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
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

  return { ok: false, reason: order.status === "failed" ? "failed" : "pending" };
}

/** The signed-in user's own order with its lines, for the confirmation screen. */
export async function getOrderForUser(reference: string, userId: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.reference, reference), eq(orders.userId, userId)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}
