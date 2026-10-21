import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/account/StatusPill";
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

  return (
    <>
      <Link href="/admin/orders" className="text-fs-14 text-mute underline underline-offset-4">All orders</Link>
      <div className="mb-6 mt-2 flex items-center gap-3">
        <h1 className="text-fs-32 font-medium leading-tight">Order {vars.reference}</h1>
        <StatusPill status={order.status} />
      </div>

      {order.stockShortfall && (
        <p role="alert" className="mb-6 bg-cloud p-4 text-fs-14 font-medium text-ink">
          Oversold: stock did not cover this order when it was paid. Check stock and contact the customer or refund.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-fs-20 font-medium">Items</h2>
          <ul className="divide-y divide-hairline-soft text-fs-14">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3">
                <span>{i.qty} × {i.name} <span className="text-mute">({i.size}{i.color && `, ${i.color}`})</span></span>
                <span>{formatNaira(i.unitPriceKobo * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3"><span>Delivery</span><span>{formatNaira(order.shippingFeeKobo)}</span></li>
            <li className="flex justify-between py-3 font-medium"><span>Total</span><span>{formatNaira(order.totalKobo)}</span></li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-fs-20 font-medium">Deliver to</h2>
          <p className="text-fs-14 leading-relaxed">
            {s.fullName}<br />{s.address}<br />{s.city}, {s.state}{s.postalCode && ` ${s.postalCode}`}<br />{s.phone}<br />
            <span className="text-mute">{order.email}</span>
          </p>
          <p className="mt-3 text-fs-14 text-mute">
            Placed {order.createdAt.toLocaleString("en-NG")}
            {order.shippedAt && ` · shipped ${order.shippedAt.toLocaleDateString("en-NG")}`}
            {order.deliveredAt && ` · delivered ${order.deliveredAt.toLocaleDateString("en-NG")}`}
          </p>
        </section>
      </div>

      {step && tpl ? (
        <section className="mt-10">
          <h2 className="mb-3 text-fs-20 font-medium">{step === "shipped" ? "Mark as shipped" : "Mark as delivered"}</h2>
          <OrderStatusForm
            key={order.status}
            orderId={order.id}
            step={step}
            defaultSubject={fill(tpl.subject, vars)}
            defaultMessage={fill(tpl.body, vars)}
          />
        </section>
      ) : (
        <p className="mt-10 text-fs-14 text-mute">
          {order.status === "delivered" ? "This order has been delivered." : `A ${order.status} order can't be advanced.`}
        </p>
      )}
    </>
  );
}
