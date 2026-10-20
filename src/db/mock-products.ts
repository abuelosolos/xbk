import type { Product, ProductColor } from "@/lib/types";

/**
 * Seed/demo catalogue. Used as the storefront data source when DATABASE_URL is
 * not set, and by `npm run db:seed` to populate Neon.
 */
const n = (naira: number) => naira * 100;

const BLACK: ProductColor = { name: "Black", hex: "#111111" };
const WHITE: ProductColor = { name: "White", hex: "#ffffff" };
const GREY: ProductColor = { name: "Grey", hex: "#9e9ea0" };
const SAND: ProductColor = { name: "Sand", hex: "#d8cfc0" };
const OLIVE: ProductColor = { name: "Olive", hex: "#55574a" };

const SHOE = ["38", "39", "40", "41", "42", "43", "44", "45"];
const KIDS_SHOE = ["28", "29", "30", "31", "32"];
const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];

type Seed = Omit<Product, "id" | "images" | "stock" | "salePriceKobo" | "badge" | "description"> &
  Partial<Pick<Product, "salePriceKobo" | "badge" | "description" | "stock">>;

const seeds: Seed[] = [
  { slug: "apex-runner", name: "XBK Apex Runner", subtitle: "Men's Road Running Shoes", category: "footwear", gender: "men", priceKobo: n(85000), colors: [BLACK, WHITE, GREY], sizes: SHOE, badge: "Just In" },
  { slug: "vector-trainer", name: "XBK Vector Trainer", subtitle: "Women's Training Shoes", category: "footwear", gender: "women", priceKobo: n(78000), salePriceKobo: n(62400), colors: [WHITE, SAND], sizes: SHOE.slice(0, 6) },
  { slug: "delta-court", name: "XBK Delta Court", subtitle: "Unisex Lifestyle Shoes", category: "footwear", gender: "unisex", priceKobo: n(69000), colors: [WHITE, BLACK], sizes: SHOE },
  { slug: "summit-trail", name: "XBK Summit Trail", subtitle: "Men's Trail Running Shoes", category: "footwear", gender: "men", priceKobo: n(98000), colors: [OLIVE, BLACK], sizes: SHOE.slice(2), badge: "Member Exclusive" },
  { slug: "core-tee", name: "XBK Core Tee", subtitle: "Men's Performance T-Shirt", category: "clothing", gender: "men", priceKobo: n(24000), colors: [BLACK, WHITE, GREY, OLIVE], sizes: APPAREL },
  { slug: "flux-tank", name: "XBK Flux Tank", subtitle: "Women's Training Tank", category: "clothing", gender: "women", priceKobo: n(21000), colors: [BLACK, SAND], sizes: APPAREL.slice(0, 5) },
  { slug: "orbit-hoodie", name: "XBK Orbit Hoodie", subtitle: "Unisex Fleece Hoodie", category: "clothing", gender: "unisex", priceKobo: n(52000), salePriceKobo: n(41600), colors: [BLACK, GREY], sizes: APPAREL },
  { slug: "stride-short", name: "XBK Stride Short", subtitle: "Men's 7\" Running Shorts", category: "clothing", gender: "men", priceKobo: n(28000), colors: [BLACK, OLIVE], sizes: APPAREL },
  { slug: "pulse-legging", name: "XBK Pulse Legging", subtitle: "Women's High-Rise Leggings", category: "clothing", gender: "women", priceKobo: n(38000), colors: [BLACK, SAND, OLIVE], sizes: APPAREL.slice(0, 5), badge: "Just In" },
  { slug: "peak-jacket", name: "XBK Peak Jacket", subtitle: "Men's Windbreaker", category: "clothing", gender: "men", priceKobo: n(74000), colors: [BLACK, GREY], sizes: APPAREL.slice(1) },
  { slug: "mini-runner", name: "XBK Mini Runner", subtitle: "Kids' Running Shoes", category: "footwear", gender: "kids", priceKobo: n(45000), colors: [WHITE, BLACK], sizes: KIDS_SHOE },
  { slug: "daily-backpack", name: "XBK Daily Backpack", subtitle: "Unisex Backpack (22L)", category: "accessories", gender: "unisex", priceKobo: n(35000), colors: [BLACK, OLIVE], sizes: ["One Size"] },
  { slug: "crew-socks", name: "XBK Crew Socks (3 Pack)", subtitle: "Unisex Cushioned Socks", category: "accessories", gender: "unisex", priceKobo: n(9500), salePriceKobo: n(7600), colors: [WHITE, BLACK], sizes: ["M", "L"] },
];

export const MOCK_PRODUCTS: Product[] = seeds.map((s) => ({
  id: s.slug,
  images: [],
  stock: s.stock ?? 25,
  salePriceKobo: s.salePriceKobo ?? null,
  badge: s.badge ?? null,
  description:
    s.description ??
    `${s.name} is built for the move: a clean, lightweight silhouette in a restrained black-and-white palette. Placeholder copy — edit this in the admin dashboard.`,
  ...s,
}));
