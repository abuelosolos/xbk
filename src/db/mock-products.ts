import type { Product, ProductColor } from "@/lib/types";

/**
 * Seed/demo catalogue. Used as the storefront data source when DATABASE_URL is
 * not set, and by `npm run db:seed` / `db:replace-catalogue` to populate Neon.
 * Photos are files in `public/` (AI-generated placeholders for now).
 */
const n = (naira: number) => naira * 100;

const BLACK: ProductColor = { name: "Black", hex: "#111111" };
const WHITE: ProductColor = { name: "White", hex: "#ffffff" };
const OFF_WHITE: ProductColor = { name: "Off White", hex: "#f1ede4" };
const GREY: ProductColor = { name: "Grey", hex: "#9e9ea0" };
const SAND: ProductColor = { name: "Sand", hex: "#d8c7a3" };
const OLIVE: ProductColor = { name: "Olive", hex: "#55574a" };
const STRIPE: ProductColor = { name: "Black & Cream", hex: "#111111" };

const SHOE = ["38", "39", "40", "41", "42", "43", "44", "45"];
const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const ONE_SIZE = ["One Size"];

type Seed = Omit<Product, "id" | "images" | "stock" | "salePriceKobo" | "badge"> &
  Partial<Pick<Product, "salePriceKobo" | "badge" | "stock">> & {
    /** Files in `public/`, first one is the card image. */
    photos: string[];
  };

const seeds: Seed[] = [
  // Jackets & outerwear
  {
    slug: "leather-bomber-black", name: "XBK Leather Bomber", subtitle: "Women's Oversized Bomber", category: "clothing", subcategory: "jackets", gender: "women",
    priceKobo: n(135000), colors: [BLACK], sizes: APPAREL, badge: "Just In",
    photos: ["xbk-leather-bomber-black.jpg"],
    description: "A glossy black bomber with structured shoulders, ribbed cuffs and a full zip. Cut oversized to layer over a crisp shirt.",
  },
  {
    slug: "puffer-jacket-off-white", name: "XBK Puffer Jacket", subtitle: "Women's Puffer Jacket", category: "clothing", subcategory: "jackets", gender: "women",
    priceKobo: n(120000), colors: [OFF_WHITE], sizes: APPAREL,
    photos: ["xbk-puffer-jacket-off-white.jpg"],
    description: "A boxy off-white puffer with a high collar, elastic cuffs and a full-length zip. Warm without the bulk.",
  },
  {
    slug: "overshirt-olive", name: "XBK Chore Overshirt", subtitle: "Women's Overshirt", category: "clothing", subcategory: "jackets", gender: "women",
    priceKobo: n(62000), colors: [OLIVE], sizes: APPAREL,
    photos: ["xbk-overshirt-olive.jpg"],
    description: "A relaxed olive cotton overshirt with two chest pockets and a snap front. Wear it open over a tee or buttoned up.",
  },
  {
    slug: "track-jacket-grey", name: "XBK Track Jacket", subtitle: "Men's Lightweight Jacket", category: "clothing", subcategory: "jackets", gender: "men",
    priceKobo: n(55000), colors: [GREY], sizes: APPAREL,
    photos: ["xbk-track-jacket-grey.jpeg"],
    description: "A crisp grey zip-through jacket in a light, crinkled shell with a stand collar and elastic cuffs.",
  },

  // Knitwear
  {
    slug: "striped-cardigan-black-cream", name: "XBK Stripe Cardigan", subtitle: "Men's Chunky Knit Cardigan", category: "clothing", subcategory: "knitwear", gender: "men",
    priceKobo: n(58000), colors: [STRIPE], sizes: APPAREL, badge: "Just In",
    photos: ["xbk-striped-cardigan-black-cream.jpeg"],
    description: "A chunky rib-knit cardigan in bold black and cream stripes, with a deep V and oversized sleeves.",
  },
  {
    slug: "knit-cardigan-olive", name: "XBK Knit Cardigan", subtitle: "Men's Knit Cardigan", category: "clothing", subcategory: "knitwear", gender: "men",
    priceKobo: n(58000), colors: [OLIVE], sizes: APPAREL,
    photos: ["xbk-knit-cardigan-olive.jpeg"],
    description: "A soft olive knit cardigan with ribbed trims and horn-look buttons. A relaxed layer for cooler evenings.",
  },

  // Tops
  {
    slug: "poplin-shirt-white", name: "XBK Poplin Shirt", subtitle: "Women's Oversized Shirt", category: "clothing", subcategory: "tops", gender: "women",
    priceKobo: n(42000), colors: [WHITE], sizes: APPAREL,
    photos: ["xbk-poplin-shirt-white.jpg"],
    description: "An oversized white poplin shirt with a relaxed drop shoulder and a small triangle badge on the chest.",
  },
  {
    slug: "oversized-tee-black", name: "XBK Oversized Tee (Black)", subtitle: "Unisex Oversized T-Shirt", category: "clothing", subcategory: "tops", gender: "unisex",
    priceKobo: n(22000), colors: [BLACK], sizes: APPAREL,
    photos: ["xbk-oversized-tee-black.jpg"],
    description: "Heavyweight black cotton with a boxy fit, dropped shoulders and a small cream XBK mark on the chest.",
  },
  {
    slug: "oversized-tee-white", name: "XBK Oversized Tee (White)", subtitle: "Unisex Oversized T-Shirt", category: "clothing", subcategory: "tops", gender: "unisex",
    priceKobo: n(22000), colors: [WHITE], sizes: APPAREL,
    photos: ["xbk-oversized-tee-white.jpeg"],
    description: "Heavyweight white cotton with a boxy fit, dropped shoulders and a small black XBK mark on the chest.",
  },

  // Hoodies
  {
    slug: "hoodie-black", name: "XBK Core Hoodie", subtitle: "Unisex Fleece Hoodie", category: "clothing", subcategory: "hoodies", gender: "unisex",
    priceKobo: n(48000), colors: [BLACK], sizes: APPAREL,
    photos: ["xbk-hoodie-black.jpeg"],
    description: "A heavyweight black brushed-fleece hoodie with a deep hood, kangaroo pocket and an easy oversized fit.",
  },

  // Footwear
  {
    slug: "court-sneaker-black", name: "XBK Court Sneaker (Black)", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(68000), colors: [BLACK], sizes: SHOE, badge: "Just In",
    photos: ["xbk-court-sneaker-black.jpg"],
    description: "A low-top court shoe in black suede with white leather toe and heel tab on a classic gum sole.",
  },
  {
    slug: "court-sneaker-olive", name: "XBK Court Sneaker (Olive)", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(68000), colors: [OLIVE], sizes: SHOE,
    photos: ["xbk-court-sneaker-olive.jpg"],
    description: "A low-top court shoe in olive suede with cream toe and heel on a gum sole, laced with matching olive laces.",
  },
  {
    slug: "court-sneaker-grey", name: "XBK Court Sneaker (Grey)", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(68000), colors: [GREY], sizes: SHOE,
    photos: ["xbk-court-sneaker-grey.jpg"],
    description: "A low-top court shoe in light grey suede with a white leather side panel and a gum sole.",
  },
  {
    slug: "court-sneaker-white", name: "XBK Court Sneaker (White)", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(68000), colors: [WHITE], sizes: SHOE,
    photos: ["xbk-court-sneaker-white.jpg"],
    description: "A low-top court shoe in smooth white leather with black suede toe and heel, black laces and a gum sole.",
  },
  {
    slug: "court-sneaker-beige", name: "XBK Court Sneaker (Beige)", subtitle: "Unisex Lifestyle Shoes", category: "footwear", subcategory: "lifestyle", gender: "unisex",
    priceKobo: n(68000), colors: [SAND], sizes: SHOE,
    photos: ["xbk-court-sneaker-beige.jpg"],
    description: "A low-top court shoe in beige suede with black leather toe and heel, black laces and a gum sole.",
  },
  {
    slug: "work-boot-black", name: "XBK Work Boot (Black)", subtitle: "Unisex Lace-Up Boots", category: "footwear", subcategory: "boots", gender: "unisex",
    priceKobo: n(95000), colors: [BLACK], sizes: SHOE,
    photos: ["xbk-work-boot-black.jpeg"],
    description: "A six-inch lace-up boot in black nubuck with a padded grey collar, white midsole and a deep lugged outsole.",
  },
  {
    slug: "work-boot-sand", name: "XBK Work Boot (Sand)", subtitle: "Unisex Lace-Up Boots", category: "footwear", subcategory: "boots", gender: "unisex",
    priceKobo: n(95000), colors: [SAND], sizes: SHOE,
    photos: ["xbk-work-boot-sand.jpeg"],
    description: "A six-inch lace-up boot in sand suede with an olive collar, laces and lugged outsole.",
  },

  // Accessories: one product per item, each colour with its own photos
  {
    slug: "dad-cap", name: "XBK Dad Cap", subtitle: "Unisex Cotton Cap", category: "accessories", subcategory: "caps", gender: "unisex",
    priceKobo: n(15000), sizes: ONE_SIZE,
    colors: [{ ...BLACK, images: ["/xbk-dad-cap-black.jpg"] }, { ...WHITE, images: ["/xbk-dad-cap-white.jpg"] }],
    photos: ["xbk-dad-cap-black.jpg", "xbk-dad-cap-white.jpg"],
    description: "A soft, curved-brim cotton cap with an embroidered XBK triangle and an adjustable strap. Black with a white mark, or white with a black mark.",
  },
  {
    slug: "leather-belt", name: "XBK Leather Belt", subtitle: "Unisex Leather Belt", category: "accessories", subcategory: "belts", gender: "unisex",
    priceKobo: n(18000), sizes: ONE_SIZE,
    colors: [{ ...BLACK, images: ["/xbk-leather-belt-black.jpeg"] }, { ...WHITE, images: ["/xbk-leather-belt-white.jpeg"] }],
    photos: ["xbk-leather-belt-black.jpeg", "xbk-leather-belt-white.jpeg"],
    description: "A slim leather belt with a long tail. Black with a brushed-silver buckle, or white with a matte black buckle and a small XBK triangle.",
  },
];

export const MOCK_PRODUCTS: Product[] = seeds.map(({ photos, ...s }) => ({
  id: s.slug,
  images: photos.map((file) => `/${file}`),
  stock: s.stock ?? 25,
  salePriceKobo: s.salePriceKobo ?? null,
  badge: s.badge ?? null,
  ...s,
}));
export { CATEGORIES as MOCK_CATEGORIES } from "./catalog-data";
