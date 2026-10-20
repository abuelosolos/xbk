import { matchesType } from "./collections";
import type { Gender, Product } from "./types";

export type PriceBucket = "all" | "u30" | "30-60" | "60-100" | "o100";
export type SortKey = "featured" | "price-asc" | "price-desc";

export const PRICE_BUCKETS: { id: PriceBucket; label: string; min: number; max: number }[] = [
  { id: "all", label: "All prices", min: 0, max: Infinity },
  { id: "u30", label: "Under ₦30,000", min: 0, max: 30_000_00 },
  { id: "30-60", label: "₦30,000 – ₦60,000", min: 30_000_00, max: 60_000_00 },
  { id: "60-100", label: "₦60,000 – ₦100,000", min: 60_000_00, max: 100_000_00 },
  { id: "o100", label: "Over ₦100,000", min: 100_000_00, max: Infinity },
];

export interface Filters {
  q: string;
  genders: Gender[];
  categories: string[];
  /** sub-category slugs from lib/collections PRODUCT_TYPES */
  types: string[];
  sizes: string[];
  colors: string[];
  price: PriceBucket;
  saleOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  genders: [],
  categories: [],
  types: [],
  sizes: [],
  colors: [],
  price: "all",
  saleOnly: false,
};

export const effectivePrice = (p: Product) => p.salePriceKobo ?? p.priceKobo;

export function applyFilters(products: Product[], f: Filters, sort: SortKey): Product[] {
  const bucket = PRICE_BUCKETS.find((b) => b.id === f.price)!;
  const q = f.q.trim().toLowerCase();

  const out = products.filter((p) => {
    // "men"/"women" listings also include unisex pieces
    if (f.genders.length && !f.genders.includes(p.gender) && p.gender !== "unisex") return false;
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.types.length && !f.types.some((t) => matchesType(p, t))) return false;
    if (f.sizes.length && !f.sizes.some((s) => p.sizes.includes(s))) return false;
    if (f.colors.length && !f.colors.some((c) => p.colors.some((pc) => pc.name === c))) return false;
    if (f.saleOnly && p.salePriceKobo === null) return false;
    const price = effectivePrice(p);
    if (price < bucket.min || price >= bucket.max) return false;
    if (q && !`${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (sort === "price-asc") out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (sort === "price-desc") out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  return out;
}

export const activeFilterCount = (f: Filters) =>
  f.genders.length +
  f.categories.length +
  f.types.length +
  f.sizes.length +
  f.colors.length +
  (f.price !== "all" ? 1 : 0) +
  (f.saleOnly ? 1 : 0);
