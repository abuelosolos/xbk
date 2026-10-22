import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/account/StatusPill";
import { Card, Notice, PageHeader } from "@/components/admin/ui/layout";
import { CancelOrderForm } from "@/components/admin/CancelOrderForm";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { getDb, hasDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { fill, getTemplate } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/session";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  if (!hasDb() || !UUID.test(id)) notFound();

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const s = order.shipping;
  const vars = { name: s.fullName.split(" ")[0], reference: order.reference.slice(-8).toUpperCase(), state: s.state };
  const step = order.status === "paid" ? "shipped" : order.status === "shipped" ? "delivered" : null;
  const tpl = step ? await getTemplate(step === "shipped" ? "order_shipped" : "order_delivered") : null;

  const steps = [
    { label: "Paid", at: order.paidAt },
    { label: "Shipped", at: order.shippedAt },
    { label: "Delivered", at: order.deliveredAt },
  ];
  const when = (d: Date | null) => (d ? d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Not yet");
  const subtotal = order.totalKobo - order.shippingFeeKobo;

  return (
    <>
      <PageHeader title={`Order ${vars.reference}`} back={{ href: "/admin/orders", label: "All orders" }} status={<StatusPill status={order.status} />} />

      {order.stockShortfall && (
        <Notice role="alert">Oversold: stock did not cover this order when it was paid. Check stock and contact the customer or refund.</Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {step && tpl && (
            <Card title={step === "shipped" ? "Mark as shipped" : "Mark as delivered"} hint="Moves the order forward one step. This can't be undone.">
              <OrderStatusForm
                key={order.status}
                orderId={order.id}
                step={step}
                defaultSubject={fill(tpl.subject, vars)}
                defaultMessage={fill(tpl.body, vars)}
              />
            </Card>
          )}

          <Card title="Items">
            <ul className="divide-y divide-hairline-soft text-fs-14">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3">
                  <span>{i.qty} × {i.name} <span className="text-mute">({i.size}{i.color && `, ${i.color}`})</span></span>
                  <span className="tabular-nums">{formatNaira(i.unitPriceKobo * i.qty)}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 text-mute"><span>Subtotal</span><span className="tabular-nums">{formatNaira(subtotal)}</span></li>
              <li className="flex justify-between py-3 text-mute"><span>Delivery</span><span className="tabular-nums">{formatNaira(order.shippingFeeKobo)}</span></li>
              <li className="flex justify-between py-3 font-medium"><span>Total</span><span className="tabular-nums">{formatNaira(order.totalKobo)}</span></li>
            </ul>
          </Card>

          {(order.status === "paid" || order.status === "shipped") && (
            <Card title="Cancel or refund" hint="Returns the items to stock. Issue the refund in the Paystack dashboard.">
              <CancelOrderForm
                orderId={order.id}
                defaultMessage={`Hi ${vars.name},\n\nYour XBK order ${vars.reference} has been cancelled and your payment will be refunded to your original payment method.\n\nXBK`}
              />
            </Card>
          )}
          {order.status === "cancelled" && (
            <Card title="Cancelled">
              <p className="text-fs-14 text-mute">
                Cancelled {order.cancelledAt?.toLocaleDateString("en-NG")}. Items were returned to stock.
                {order.cancelNote && <> Note: <span className="text-ink">{order.cancelNote}</span></>}
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Progress">
            <ol className="space-y-3 text-fs-14">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span aria-hidden className={`size-3 shrink-0 rounded-full ${s.at ? "bg-ink" : "border border-hairline"}`} />
                  <span className={s.at ? "font-medium" : "text-mute"}>{s.label}</span>
                  <span className="ml-auto text-right text-mute">{when(s.at)}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Deliver to">
            <p className="text-fs-14 leading-relaxed">
              {s.fullName}<br />{s.address}<br />{s.city}, {s.state}{s.postalCode && ` ${s.postalCode}`}<br />{s.phone}<br />
              <span className="text-mute">{order.email}</span>
            </p>
          </Card>
          <Card title="Payment">
            <dl className="space-y-2 text-fs-14">
              <div className="flex justify-between gap-3"><dt className="text-mute">Placed</dt><dd>{order.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-mute">Paystack ref</dt><dd className="break-all text-right">{order.reference}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
