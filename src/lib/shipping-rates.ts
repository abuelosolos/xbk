import { hasDb, getDb } from "@/db";
import { shippingRates } from "@/db/schema";
import { DEFAULT_RATES, type ShippingRates } from "@/lib/shipping";
import { STATES } from "@/lib/states";

/** Live rates in dropdown order; falls back to the built-in defaults without a database or rows. */
export async function getShippingRates(): Promise<ShippingRates> {
  if (!hasDb()) return DEFAULT_RATES;
  try {
    const rows = await getDb().select().from(shippingRates);
    if (rows.length === 0) return DEFAULT_RATES;
    const byState = new Map(rows.map((r) => [r.state, r]));
    return STATES.map((state) => {
      const r = byState.get(state);
      return r ? { state, feeKobo: r.feeKobo, minDays: r.minDays, maxDays: r.maxDays, active: r.active } : DEFAULT_RATES.find((d) => d.state === state)!;
    });
  } catch (err) {
    console.error("Loading shipping rates failed", err);
    return DEFAULT_RATES;
  }
}
