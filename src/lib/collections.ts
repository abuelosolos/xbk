import { unsplash } from "./images";
import type { Gender, Product } from "./types";

/**
 * Sub-categories ("types") inside each category. Products don't store a type,
 * so it's derived from name + subtitle; add a pattern here when you add a new
 * kind of product.
 */
export interface ProductType {
  slug: string;
  label: string;
  category: string;
  pattern: RegExp;
}

export const PRODUCT_TYPES: ProductType[] = [
  { slug: "running", label: "Running", category: "footwear", pattern: /running/i },
  { slug: "training", label: "Training & Gym", category: "footwear", pattern: /training/i },
  { slug: "lifestyle", label: "Lifestyle", category: "footwear", pattern: /lifestyle/i },
  { slug: "tops", label: "Tops & T-Shirts", category: "clothing", pattern: /t-shirt|tee|tank|top/i },
  { slug: "hoodies", label: "Hoodies & Sweatshirts", category: "clothing", pattern: /hoodie|sweatshirt/i },
  { slug: "shorts", label: "Shorts", category: "clothing", pattern: /short/i },
  { slug: "leggings", label: "Leggings & Tights", category: "clothing", pattern: /legging|tight/i },
  { slug: "jackets", label: "Jackets & Outerwear", category: "clothing", pattern: /jacket|windbreaker/i },
  { slug: "bags", label: "Bags & Backpacks", category: "accessories", pattern: /bag|backpack/i },
  { slug: "socks", label: "Socks", category: "accessories", pattern: /sock/i },
];

export const findType = (slug?: string | null) => PRODUCT_TYPES.find((t) => t.slug === slug);

export const matchesType = (p: Product, slug: string) => {
  const t = findType(slug);
  return !!t && p.category === t.category && t.pattern.test(`${p.name} ${p.subtitle}`);
};

export const CATEGORY_LABEL: Record<string, string> = { footwear: "Shoes", clothing: "Clothing", accessories: "Accessories" };

/** Lifestyle photography for category-level tiles (Unsplash photo ids). */
const CATEGORY_PHOTO: Record<string, string> = {
  footwear: "0Mfukiqo4Us",
  clothing: "9CjMWUGBfr8",
  accessories: "d-BTL93LsGg",
};

const GENDER_LABEL: Record<Exclude<Gender, "unisex">, string> = { men: "Men's", women: "Women's", kids: "Kids'" };

export interface HubScope {
  gender?: Exclude<Gender, "unisex">;
  category?: string;
  sale?: boolean;
}

export interface Hub {
  slug: string;
  title: string;
  blurb: string;
  photo: string;
  scope: HubScope;
}

export const HUBS: Hub[] = [
  { slug: "men", title: "Men", blurb: "Shoes, clothing and kit built for the way you move.", photo: "_1BshZ602EM", scope: { gender: "men" } },
  { slug: "women", title: "Women", blurb: "Train, run and live in pieces made to keep up.", photo: "d6gfjQmCL7E", scope: { gender: "women" } },
  { slug: "kids", title: "Kids", blurb: "Tough, easy-on gear for every playground.", photo: "vspPIvHpNO4", scope: { gender: "kids" } },
  { slug: "footwear", title: "Shoes", blurb: "Road, trail, gym and street. Find your pair.", photo: "0Mfukiqo4Us", scope: { category: "footwear" } },
  { slug: "clothing", title: "Clothing", blurb: "Tees, layers and bottoms in black and white.", photo: "9CjMWUGBfr8", scope: { category: "clothing" } },
  { slug: "accessories", title: "Accessories", blurb: "Bags and socks that finish the kit.", photo: "d-BTL93LsGg", scope: { category: "accessories" } },
  { slug: "sale", title: "Sale", blurb: "Selected styles, marked down while they last.", photo: "B0s90BDX9xc", scope: { sale: true } },
];

export const findHub = (slug: string) => HUBS.find((h) => h.slug === slug);

/** Same gender rule as the shop filters: men's/women's listings include unisex pieces. */
export function inScope(p: Product, s: HubScope) {
  if (s.gender && p.gender !== s.gender && !(p.gender === "unisex" && s.gender !== "kids")) return false;
  if (s.category && p.category !== s.category) return false;
  if (s.sale && p.salePriceKobo === null) return false;
  return true;
}

/** /shop URL for a scope plus optional extra narrowing. */
export function shopHref(s: HubScope & { type?: string }) {
  const q = new URLSearchParams();
  if (s.gender) q.set("gender", s.gender);
  if (s.category) q.set("category", s.category);
  if (s.type) q.set("type", s.type);
  if (s.sale) q.set("sale", "1");
  const qs = q.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export interface Tile {
  label: string;
  href: string;
  image: string | null;
  count: number;
}

export interface HubSection {
  title: string;
  /** "feature" = big lifestyle tiles, "grid" = product-shot tiles */
  variant: "feature" | "grid";
  tiles: Tile[];
}

const typeTiles = (products: Product[], scope: HubScope, category: string): Tile[] =>
  PRODUCT_TYPES.filter((t) => t.category === category)
    .map((t) => {
      const items = products.filter((p) => matchesType(p, t.slug));
      return { label: t.label, href: shopHref({ ...scope, category, type: t.slug }), image: items[0]?.images[0] ?? null, count: items.length };
    })
    .filter((t) => t.count > 0);

/** Builds the tile sections for a hub from whatever products are in scope (empty ones are dropped). */
export function buildHub(hub: Hub, all: Product[]): { products: Product[]; sections: HubSection[] } {
  const products = all.filter((p) => inScope(p, hub.scope));
  const categories = Object.keys(CATEGORY_LABEL).filter((c) => products.some((p) => p.category === c));
  const sections: HubSection[] = [];
  const prefix = hub.scope.gender ? `${GENDER_LABEL[hub.scope.gender]} ` : hub.scope.sale ? "Sale " : "";

  if (!hub.scope.category) {
    sections.push({
      title: "Shop by Category",
      variant: "feature",
      tiles: categories.map((c) => ({
        label: `${prefix}${CATEGORY_LABEL[c]}`,
        href: shopHref({ ...hub.scope, category: c }),
        image: unsplash(CATEGORY_PHOTO[c], 1200),
        count: products.filter((p) => p.category === c).length,
      })),
    });
    for (const c of categories) {
      const tiles = typeTiles(products, hub.scope, c);
      // a lone type tile would just repeat the category tile above it
      if (tiles.length > 1) sections.push({ title: `${prefix}${CATEGORY_LABEL[c]}`, variant: "grid", tiles });
    }
  } else {
    const tiles = typeTiles(products, hub.scope, hub.scope.category);
    if (tiles.length > 1) sections.push({ title: `Shop ${hub.title} by Type`, variant: "grid", tiles });

    const genders = (Object.keys(GENDER_LABEL) as (keyof typeof GENDER_LABEL)[])
      .map((g) => {
        const items = products.filter((p) => inScope(p, { gender: g }));
        return { label: `${GENDER_LABEL[g]} ${hub.title}`, href: shopHref({ ...hub.scope, gender: g }), image: items[0]?.images[0] ?? null, count: items.length };
      })
      .filter((t) => t.count > 0);
    if (genders.length > 1) sections.push({ title: "Shop by Gender", variant: "feature", tiles: genders });
  }

  return { products, sections };
}

/** Human title for a filtered shop listing, e.g. "Men's Running Shoes". */
export function listingTitle({ gender, category, type, sale }: { gender?: Gender; category?: string; type?: string; sale?: boolean }) {
  const g = gender && gender !== "unisex" ? `${GENDER_LABEL[gender]} ` : "";
  const t = findType(type);
  const c = category ? CATEGORY_LABEL[category] ?? category : "";
  if (!t && !c) {
    if (g) return sale ? `${g}Sale` : gender![0].toUpperCase() + gender!.slice(1);
    return sale ? "Sale" : "All Products";
  }
  const core = t ? (t.category === "footwear" ? `${t.label} Shoes` : t.label) : c;
  return `${sale ? "Sale: " : ""}${g}${core}`;
}
