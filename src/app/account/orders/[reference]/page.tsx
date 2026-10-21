import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/account/StatusPill";
import { FramedImage } from "@/components/product/FramedImage";
import { ButtonLink } from "@/components/ui/Button";
import { hasDb } from "@/db";
import { getOrderForUser } from "@/lib/orders";
import { getProductsByIds } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { estimateDelivery } from "@/lib/shipping";
import { getShippingRates } from "@/lib/shipping-rates";
import { formatNaira } from "@/lib/utils";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Order" };
export const dynamic = "force-dynamic";

const long = (d: Date) => d.toLocaleDateString("en-NG", { dateStyle: "medium" });
const short = (d: Date) => d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const session = await requireUser(`/account/orders/${reference}`);
  const found = hasDb() ? await getOrderForUser(reference, session.user.id) : null;
  if (!found) notFound();

  const { order, items } = found;
  const catalogue = new Map(
    (await getProductsByIds([...new Set(items.map((i) => i.productId))], { includeArchived: true })).map((p) => [p.id, p]),
  );
  const subtotal = order.totalKobo - order.shippingFeeKobo;
  const settled = order.status === "paid" || order.status === "shipped" || order.status === "delivered";
  const eta = estimateDelivery(await getShippingRates(), order.shipping.state, order.paidAt ?? order.createdAt);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-8 md:pt-12 lg:px-12 lg:pb-24 lg:pt-16">
      <Link href="/account" className="mb-6 inline-flex items-center gap-1 text-fs-14 text-mute transition hover:text-ink">
        <CaretLeft size={16} aria-hidden /> Orders
      </Link>

      <header className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <h1 className="text-fs-32 font-medium leading-tight">Order {order.reference.slice(-8).toUpperCase()}</h1>
        <div className="flex items-center gap-3">
          <span className="text-fs-14 text-mute md:text-fs-16">{long(order.createdAt)}</span>
          <StatusPill status={order.status} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
        <ul className="divide-y divide-hairline-soft border-y border-hairline-soft">
          {items.map((i) => {
            const product = catalogue.get(i.productId);
            const card = (
              <FramedImage
                src={product?.images[0]}
                label={i.name}
                sizes="120px"
                className="size-24 shrink-0 md:size-[120px]"
              />
            );
            return (
              <li key={i.id} className="flex gap-4 py-6 md:gap-6">
                {product ? <Link href={`/product/${product.slug}`}>{card}</Link> : card}
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-fs-16 font-medium leading-snug">{i.name}</p>
                    <p className="text-fs-14 text-mute">{[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")}</p>
                    <p className="text-fs-14 text-mute">Qty {i.qty}</p>
                  </div>
                  <p className="text-fs-16 font-medium">{formatNaira(i.unitPriceKobo * i.qty)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
          <section className="bg-cloud p-6">
            <h2 className="mb-3 text-fs-14 text-mute">Summary</h2>
            <dl className="space-y-1 text-fs-16">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{formatNaira(order.shippingFeeKobo)}</dd></div>
              <div className="flex justify-between border-t border-hairline pt-2 font-medium"><dt>Total</dt><dd>{formatNaira(order.totalKobo)}</dd></div>
            </dl>
            {order.paidAt && <p className="mt-3 text-fs-14 text-mute">Paid {long(order.paidAt)}</p>}
          </section>

          <section className="bg-cloud p-6">
            <h2 className="mb-3 text-fs-14 text-mute">Delivering to</h2>
            <address className="text-fs-16 not-italic leading-snug">
              <span className="font-medium">{order.shipping.fullName}</span>
              <br />
              {order.shipping.address}
              <br />
              {order.shipping.city}, {order.shipping.state}
              <br />
              <span className="text-mute">{order.shipping.phone}</span>
            </address>
          </section>

          {settled && (
            <section className="bg-cloud p-6">
              <h2 className="mb-3 text-fs-14 text-mute">Estimated delivery</h2>
              <p className="text-fs-24 font-medium leading-tight">
                {short(eta.earliest)} – {short(eta.latest)}
              </p>
            </section>
          )}

          {order.status === "failed" && (
            <ButtonLink href="/checkout" size="lg" className="mt-4 w-full">Try Again</ButtonLink>
          )}
        </aside>
      </div>
    </div>
  );
}
