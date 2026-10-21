"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { sendCustomerEmail } from "@/lib/email";
import { fill } from "@/lib/email-templates";
import { cancelOrderAndRestock } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export type OrderActionState = { ok?: boolean; error?: string; emailed?: boolean };

async function advance(
  id: string,
  from: "paid" | "shipped",
  to: "shipped" | "delivered",
  formData: FormData,
): Promise<OrderActionState> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const sendEmail = formData.get("sendEmail") === "on";
  if (sendEmail && (!subject || !message)) return { error: "Add a subject and message, or untick “Email the customer”." };

  const stamp = to === "shipped" ? { shippedAt: new Date() } : { deliveredAt: new Date() };
  // One guarded update: forward-only, and a second click matches no row.
  const [order] = await getDb()
    .update(orders)
    .set({ status: to, ...stamp })
    .where(and(eq(orders.id, id), eq(orders.status, from)))
    .returning();
  if (!order) return { error: `This order is no longer ${from}; refresh to see its current status.` };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");

  let emailed = false;
  if (sendEmail) {
    const vars = { name: order.shipping.fullName.split(" ")[0], reference: order.reference.slice(-8).toUpperCase(), state: order.shipping.state };
    emailed = await sendCustomerEmail({ to: order.email, subject: fill(subject, vars), text: fill(message, vars) });
  }
  return { ok: true, emailed };
}

export async function markShipped(id: string, _prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin(`/admin/orders/${id}`);
  return advance(id, "paid", "shipped", formData);
}

export async function markDelivered(id: string, _prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin(`/admin/orders/${id}`);
  return advance(id, "shipped", "delivered", formData);
}

/** Refunds are issued from the Paystack dashboard; the reference is stored here so the order shows it. */
export async function cancelOrder(id: string, _prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const { user } = await requireAdmin(`/admin/orders/${id}`);
  const note = String(formData.get("note") ?? "").trim();
  if (note.length > 200) return { error: "Keep the note under 200 characters." };
  const message = String(formData.get("message") ?? "").trim();
  const sendEmail = formData.get("sendEmail") === "on";
  if (sendEmail && !message) return { error: "Add a message, or untick “Email the customer”." };

  const { moved } = await cancelOrderAndRestock(id, user.id, note || null);
  if (!moved) return { error: "This order can no longer be cancelled; refresh to see its current status." };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/account");

  let emailed = false;
  if (sendEmail) {
    const [order] = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
    if (order) {
      const vars = { name: order.shipping.fullName.split(" ")[0], reference: order.reference.slice(-8).toUpperCase(), state: order.shipping.state };
      emailed = await sendCustomerEmail({ to: order.email, subject: `Your XBK order ${vars.reference} was cancelled`, text: fill(message, vars) });
    }
  }
  return { ok: true, emailed };
}
