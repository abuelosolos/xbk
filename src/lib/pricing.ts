export const MAX_PRICE_KOBO = 2_000_000_000; // integer column limit, same as the product form

/**
 * Applies a percentage change (e.g. -10 or 5.5) to a price in kobo. Works in basis points so there is no
 * floating-point drift. Returns null when the result would be below 1 kobo or above the column limit.
 */
export function scaleKobo(kobo: number, percent: number) {
  const bp = Math.round(percent * 100);
  const next = Math.round((kobo * (10_000 + bp)) / 10_000);
  return next >= 1 && next <= MAX_PRICE_KOBO ? next : null;
}
