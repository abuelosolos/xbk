import type { OrderSummary } from "@/components/checkout/OrderResultDialog";
import { hasDb } from "@/db";
import { getOrderForUser } from "@/lib/orders";
import { estimateDelivery } from "@/lib/shipping";
import { getShippingRates } from "@/lib/shipping-rates";

/** The receipt data for one of the user's orders, or null (missing, not theirs, or no database). */
export async function loadOrderSummary(reference: string, userId: string): Promise<OrderSummary | null> {
  if (!hasDb()) return null;
  try {
    const found = await getOrderForUser(reference, userId);
    if (!found) return null;
    const { order, items } = found;
    const eta = estimateDelivery(await getShippingRates(), order.shipping.state, order.paidAt ?? order.createdAt);
    return {
      reference: order.reference,
      email: order.email,
      status: order.status,
      subtotalKobo: order.totalKobo - order.shippingFeeKobo,
      shippingFeeKobo: order.shippingFeeKobo,
      totalKobo: order.totalKobo,
      address: order.shipping,
      items,
      delivery: { earliest: eta.earliest.toISOString(), latest: eta.latest.toISOString() },
    };
  } catch (err) {
    console.error("Order lookup failed", err);
    return null;
  }
}
