import type { Metadata } from "next";
import { OrderResultDialog, OrderResultPage } from "@/components/checkout/OrderResultDialog";
import { ButtonLink } from "@/components/ui/Button";
import { hasDb } from "@/db";
import { SmallScreenRedirect } from "@/components/checkout/SmallScreenRedirect";
import { loadOrderSummary } from "@/lib/order-summary";
import { settleOrderByReference, type SettleResult } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Order Status" };
export const dynamic = "force-dynamic";

type SP = Promise<{ reference?: string; trxref?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SP }) {
  const session = await requireUser("/checkout/success");
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

  const summary = reference ? await loadOrderSummary(reference, session.user.id) : null;
  const state = result.ok ? "success" : !result.ok && result.reason === "pending" ? "pending" : "failed";

  const copy = result.ok
    ? { title: "Order confirmed.", body: "Thanks — your payment went through. We'll be in touch about delivery." }
    : result.reason === "pending"
      ? { title: "Payment pending.", body: "We haven't received confirmation yet. Refresh in a moment or check your account." }
      : { title: "Payment not completed.", body: "Your bag is still saved. You can try checking out again." };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-4 py-24 lg:px-12">
      <OrderResultPage state={state} order={summary} />
      {summary ? (
        // small screens carry on to the bag, with the receipt as a popup over it
        <SmallScreenRedirect to={`/cart?order=${encodeURIComponent(summary.reference)}`} />
      ) : (
        <>
          <h1 className="display-campaign lg:hidden">{copy.title}</h1>
          <p className="max-w-md text-fs-16 text-mute lg:hidden">{copy.body}</p>
          <div className="flex gap-3 lg:hidden">
            <ButtonLink href="/account">View Orders</ButtonLink>
            <OrderResultDialog state={state} order={summary} />
          </div>
        </>
      )}
    </div>
  );
}
