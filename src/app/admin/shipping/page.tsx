import { requireAdmin } from "@/lib/session";
import { ShippingRatesForm } from "@/components/admin/ShippingRatesForm";
import { Notice, PageHeader } from "@/components/admin/ui/layout";
import { hasDb } from "@/db";
import { getShippingRates } from "@/lib/shipping-rates";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  await requireAdmin("/admin/shipping");
  const rates = await getShippingRates();
  return (
    <>
      <PageHeader
        title="Shipping"
        description="Delivery fee and estimated window per state. Days are business days. Existing orders keep the fee they were charged. Untick Active to stop delivering to a state."
      />
      {hasDb() ? <ShippingRatesForm rates={rates} /> : <Notice>Set DATABASE_URL to edit shipping rates.</Notice>}
    </>
  );
}
