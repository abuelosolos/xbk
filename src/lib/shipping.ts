import { nairaToKobo } from "./utils";

// TODO(owner): confirm these rates. Lagos gets the lower flat fee, every other state the higher one.
const HOME_STATE = "lagos";
const HOME_FEE_KOBO = nairaToKobo("3000");
const OTHER_FEE_KOBO = nairaToKobo("5000");

/** Delivery fee for a state name as typed at checkout. Shared by the form (display) and `api/checkout` (authoritative). */
export function shippingFeeKobo(state: string) {
  return state.trim().toLowerCase().replace(/\s+state$/, "") === HOME_STATE ? HOME_FEE_KOBO : OTHER_FEE_KOBO;
}
