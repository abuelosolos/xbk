import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { CartOrderDialog } from "@/components/checkout/CartOrderDialog";
import { loadOrderSummary } from "@/lib/order-summary";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Bag" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: reference } = await searchParams;
  // ownership is enforced by the lookup: someone else's reference yields no popup
  const session = reference ? await getSession().catch(() => null) : null;
  const summary = reference && session ? await loadOrderSummary(reference, session.user.id) : null;

  return (
    <>
      <CartView />
      {summary && <CartOrderDialog order={summary} />}
    </>
  );
}
