import { normalizeState, STATES } from "./states";
import { nairaToKobo } from "./utils";

export type ShippingRate = { state: string; feeKobo: number; minDays: number; maxDays: number; active: boolean };
export type ShippingRates = ShippingRate[];

// Defaults, mirrored by migration 0004 and used when no database is configured. Live rates are edited
// at /admin/shipping and read with `getShippingRates` (lib/shipping-rates.ts).
const LOW_FEE_STATES = new Set(["Rivers", "Lagos", "Abuja (FCT)", "Imo"]);

export const DEFAULT_RATES: ShippingRates = STATES.map((state) => ({
  state,
  feeKobo: nairaToKobo(LOW_FEE_STATES.has(state) ? "3500" : "8500"),
  minDays: state === "Rivers" ? 1 : 5,
  maxDays: state === "Rivers" ? 2 : 7,
  active: true,
}));

/** True when we currently deliver to the state (unknown states are not deliverable). */
export const deliversTo = (rates: ShippingRates, state: string) => rateFor(rates, state)?.active === true;

/** The rate for a state as typed or stored (legacy free text is normalised); null for unknown states. */
export function rateFor(rates: ShippingRates, state: string): ShippingRate | null {
  const name = normalizeState(state);
  return (name && rates.find((r) => r.state === name)) || null;
}

/** Delivery fee for a state. Shared by the form (display) and `api/checkout` (authoritative). Unknown states pay the highest rate. */
export function shippingFeeKobo(rates: ShippingRates, state: string) {
  return rateFor(rates, state)?.feeKobo ?? Math.max(...rates.map((r) => r.feeKobo));
}

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  while (days > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days--;
  }
  return d;
}

/** Estimated delivery window for a state, counted from `from` in business days. */
export function estimateDelivery(rates: ShippingRates, state: string, from = new Date()) {
  const r = rateFor(rates, state) ?? { minDays: 5, maxDays: 7 };
  return { earliest: addBusinessDays(from, r.minDays), latest: addBusinessDays(from, r.maxDays) };
}

/** "1-2 business days" / "5-7 business days" for display. */
export function deliveryWindowLabel(rates: ShippingRates, state: string) {
  const r = rateFor(rates, state);
  if (!r) return null;
  return r.minDays === r.maxDays ? `${r.minDays} business days` : `${r.minDays}-${r.maxDays} business days`;
}
