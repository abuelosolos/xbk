import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await requireUser("/checkout");
  return <CheckoutForm email={session.user.email} name={session.user.name} />;
}
