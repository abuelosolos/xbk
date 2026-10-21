import { requireAdmin } from "@/lib/session";
import { ShippingRatesForm } from "@/components/admin/ShippingRatesForm";
import { hasDb } from "@/db";
import { getShippingRates } from "@/lib/shipping-rates";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireAdmin("/admin/shipping");
  const rates = await getShippingRates();
  return (
    <>
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Shipping</h1>
      <p className="mb-6 max-w-xl text-fs-16 text-mute">
        Delivery fee and estimated window per state. Days are business days. Existing orders keep the fee they were charged.
      </p>
      {hasDb() ? (
        <ShippingRatesForm rates={rates} />
      ) : (
        <p className="bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to edit shipping rates.</p>
      )}
    </>
  );
}
