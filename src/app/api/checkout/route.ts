import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, hasDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { initializeTransaction } from "@/lib/paystack";
import { shippingFeeKobo } from "@/lib/shipping";
import { getProductsByIds } from "@/lib/products";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        color: z.string().default(""),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(50),
  shipping: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(7),
    address: z.string().trim().min(5),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
  }),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in to check out." }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
  const { items, shipping } = parsed.data;

  // Prices always come from the database — never trust amounts sent by the client.
  const found = await getProductsByIds([...new Set(items.map((i) => i.productId))]);
  const byId = new Map(found.map((p) => [p.id, p]));

  const lines = [];
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) return NextResponse.json({ error: "An item in your bag is no longer available." }, { status: 409 });
    if (!product.sizes.includes(item.size)) return NextResponse.json({ error: `${product.name}: invalid size.` }, { status: 400 });
    if (product.stock < item.qty) return NextResponse.json({ error: `${product.name} is low on stock.` }, { status: 409 });
    lines.push({ product, ...item, unitPriceKobo: product.salePriceKobo ?? product.priceKobo });
  }

  const feeKobo = shippingFeeKobo(shipping.state);
  const totalKobo = lines.reduce((sum, l) => sum + l.unitPriceKobo * l.qty, 0) + feeKobo;
  const reference = `xbk_${randomUUID().replaceAll("-", "")}`;
  const db = getDb();

  const [order] = await db
    .insert(orders)
    .values({ userId: session.user.id, email: session.user.email, totalKobo, shippingFeeKobo: feeKobo, reference, shipping })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order.id,
      productId: l.product.id,
      name: l.product.name,
      size: l.size,
      color: l.color,
      qty: l.qty,
      unitPriceKobo: l.unitPriceKobo,
    })),
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  try {
    const tx = await initializeTransaction({
      email: session.user.email,
      amountKobo: totalKobo,
      reference,
      callbackUrl: `${appUrl}/checkout/success`,
      metadata: { orderId: order.id },
    });
    return NextResponse.json({ authorizationUrl: tx.authorization_url, reference });
  } catch (err) {
    console.error("Paystack initialize failed", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
}
