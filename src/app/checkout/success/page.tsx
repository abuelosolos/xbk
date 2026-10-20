import type { Metadata } from "next";
import { ClearCart } from "@/components/checkout/ClearCart";
import { ButtonLink } from "@/components/ui/Button";
import { hasDb } from "@/db";
import { settleOrderByReference, type SettleResult } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Order Status" };
export const dynamic = "force-dynamic";

type SP = Promise<{ reference?: string; trxref?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SP }) {
  await requireUser("/checkout/success");
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref;

  let result: SettleResult | { ok: false; reason: "error" | "missing" } = { ok: false, reason: "missing" };
  if (reference && hasDb()) {
    try {
      result = await settleOrderByReference(reference);
    } catch (err) {
      console.error("Order verification failed", err);
      result = { ok: false, reason: "error" };
    }
  }

  const copy = result.ok
    ? { title: "Order confirmed.", body: "Thanks — your payment went through. We'll be in touch about delivery." }
    : result.reason === "pending"
      ? { title: "Payment pending.", body: "We haven't received confirmation yet. Refresh in a moment or check your account." }
      : { title: "Payment not completed.", body: "Your bag is still saved. You can try checking out again." };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-4 py-24 lg:px-12">
      {result.ok && <ClearCart />}
      <h1 className="display-campaign">{copy.title}</h1>
      <p className="max-w-md text-[16px] text-mute">{copy.body}</p>
      <div className="flex gap-3">
        <ButtonLink href="/account">View Orders</ButtonLink>
        <ButtonLink href="/shop" variant="secondary">Keep Shopping</ButtonLink>
      </div>
    </div>
  );
}
