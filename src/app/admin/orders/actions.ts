"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { sendCustomerEmail } from "@/lib/email";
import { fill } from "@/lib/email-templates";
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
