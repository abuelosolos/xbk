import { unsplash } from "@/lib/images";
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
  Partial<Pick<Product, "salePriceKobo" | "badge" | "stock">> & {
    description: string;
    /** Unsplash photo ids, first one is the card image. */
    photos: string[];
  };

const seeds: Seed[] = [
  {
    slug: "apex-runner", name: "XBK Apex Runner", subtitle: "Men's Road Running Shoes", category: "footwear", subcategory: "running", gender: "men",
    priceKobo: n(85000), colors: [WHITE, BLACK, GREY], sizes: SHOE, badge: "Just In",
    photos: ["8GzbKs74yq4", "0Mfukiqo4Us"],
    description: "A clean white road runner with a breathable knit upper and a soft, springy foam midsole. Light enough for tempo days, cushioned enough for the long run.",
  },
  {
    slug: "vector-trainer", name: "XBK Vector Trainer", subtitle: "Women's Training Shoes", category: "footwear", subcategory: "training", gender: "women",
    priceKobo: n(78000), salePriceKobo: n(62400), colors: [WHITE, BLACK], sizes: SHOE.slice(0, 6),
    photos: ["B0s90BDX9xc"],
    description: "White upper, black accents and a flat, grippy outsole that stays planted through lifts, lunges and lateral work.",
  },
  {
    slug: "delta-court", name: "XBK Delta Court", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(69000), colors: [WHITE, BLACK], sizes: SHOE,
    photos: ["0Mfukiqo4Us", "8GzbKs74yq4"],
    description: "A low-top court silhouette in tonal white. Smooth leather-look upper, cupsole and a padded collar for all-day wear.",
  },
  {
    slug: "summit-trail", name: "XBK Summit Trail", subtitle: "Men's Trail Running Shoes", category: "footwear", subcategory: "running", gender: "men",
    priceKobo: n(98000), colors: [BLACK, OLIVE], sizes: SHOE.slice(2), badge: "Member Exclusive",
    photos: ["044uX1R-CTs"],
    description: "All-black and built for rough ground: a reinforced toe, rock plate and lugged outsole that bites on loose trail.",
  },
  {
    slug: "core-tee", name: "XBK Core Tee", subtitle: "Men's Performance T-Shirt", category: "clothing", subcategory: "tops", gender: "men",
    priceKobo: n(24000), colors: [WHITE, BLACK, GREY, OLIVE], sizes: APPAREL,
    photos: ["4rUYuwJ2vGw"],
    description: "The everyday white crew. Soft, quick-drying jersey with a relaxed fit that keeps its shape wash after wash.",
  },
  {
    slug: "flux-tank", name: "XBK Flux Tank", subtitle: "Women's Training Tank", category: "clothing", subcategory: "tops", gender: "women",
    priceKobo: n(21000), colors: [WHITE, BLACK, SAND], sizes: APPAREL.slice(0, 5),
    photos: ["gUPznplBsLI"],
    description: "A lightweight white training tank with a scoop neck and racer back for full range of motion.",
  },
  {
    slug: "orbit-hoodie", name: "XBK Orbit Hoodie", subtitle: "Unisex Fleece Hoodie", category: "clothing", subcategory: "hoodies", gender: "unisex",
    priceKobo: n(52000), salePriceKobo: n(41600), colors: [BLACK, GREY], sizes: APPAREL,
    photos: ["3aXdkQz7oY4"],
    description: "Heavyweight black brushed fleece, a deep hood and a kangaroo pocket. Warm-up, cool-down and everything in between.",
  },
  {
    slug: "stride-short", name: "XBK Stride Short", subtitle: "Men's 7\" Running Shorts", category: "clothing", subcategory: "shorts", gender: "men",
    priceKobo: n(28000), colors: [WHITE, BLACK, OLIVE], sizes: APPAREL,
    photos: ["j4nOERVgQzY"],
    description: "Light woven 7\" shorts with a soft liner and a zip back pocket. Shown in white with the Core Tee in black.",
  },
  {
    slug: "pulse-legging", name: "XBK Pulse Legging", subtitle: "Women's High-Rise Leggings", category: "clothing", subcategory: "leggings", gender: "women",
    priceKobo: n(38000), colors: [BLACK, SAND, OLIVE], sizes: APPAREL.slice(0, 5), badge: "Just In",
    photos: ["d6gfjQmCL7E"],
    description: "Black high-rise leggings in a sculpting, squat-proof knit with a wide waistband that stays put.",
  },
  {
    slug: "peak-jacket", name: "XBK Peak Jacket", subtitle: "Men's Windbreaker", category: "clothing", subcategory: "jackets", gender: "men",
    priceKobo: n(74000), colors: [BLACK, GREY], sizes: APPAREL.slice(1),
    photos: ["9CjMWUGBfr8"],
    description: "A packable black shell that blocks wind and light rain, with a full zip and a stand collar.",
  },
  {
    slug: "mini-court", name: "XBK Mini Court", subtitle: "Kids' Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "kids",
    priceKobo: n(45000), colors: [BLACK, WHITE], sizes: KIDS_SHOE,
    photos: ["vspPIvHpNO4"],
    description: "Black-and-white low-tops sized for kids, with a durable rubber toe and an easy-on padded tongue.",
  },
  {
    slug: "daily-backpack", name: "XBK Daily Backpack", subtitle: "Unisex Backpack (22L)", category: "accessories", subcategory: "bags", gender: "unisex",
    priceKobo: n(35000), colors: [BLACK, OLIVE], sizes: ["One Size"],
    photos: ["d-BTL93LsGg"],
    description: "A 22L black daypack with a padded laptop sleeve, quick-access front pocket and water-resistant base.",
  },
  {
    slug: "crew-socks", name: "XBK Crew Socks (2 Pack)", subtitle: "Unisex Cushioned Socks", category: "accessories", subcategory: "socks", gender: "unisex",
    priceKobo: n(9500), salePriceKobo: n(7600), colors: [WHITE, BLACK], sizes: ["M", "L"],
    photos: ["7-qdOoZ5-5s"],
    description: "Two pairs of white crew socks with a cushioned footbed and arch support. Built for training, fine for everything else.",
  },
];

export const MOCK_PRODUCTS: Product[] = seeds.map(({ photos, ...s }) => ({
  id: s.slug,
  images: photos.map((id) => unsplash(id)),
  stock: s.stock ?? 25,
  salePriceKobo: s.salePriceKobo ?? null,
  badge: s.badge ?? null,
  ...s,
}));
