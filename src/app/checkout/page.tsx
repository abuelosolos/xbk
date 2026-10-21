import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { listAddresses } from "@/lib/addresses";
import { getShippingRates } from "@/lib/shipping-rates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await requireUser("/checkout");
  const saved = await listAddresses(session.user.id).catch(() => []);
  const rates = await getShippingRates();
  return <CheckoutForm email={session.user.email} name={session.user.name} saved={saved} rates={rates} />;
}
