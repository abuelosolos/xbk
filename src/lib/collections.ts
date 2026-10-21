import { unsplash } from "./images";
import type { Category, Gender, Product } from "./types";

/** A sub-category looked up by slug, with the category it sits in. */
export const findSubcategory = (categories: Category[], slug?: string | null, categorySlug?: string) => {
  if (!slug) return undefined;
  for (const c of categories) {
    if (categorySlug && c.slug !== categorySlug) continue;
    const sub = c.subcategories.find((s) => s.slug === slug);
    if (sub) return { ...sub, category: c };
  }
};

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

const typeTiles = (products: Product[], scope: HubScope, category: Category): Tile[] =>
  category.subcategories
    .map((sub) => {
      const items = products.filter((p) => p.category === category.slug && p.subcategory === sub.slug);
      return { label: sub.name, href: shopHref({ ...scope, category: category.slug, type: sub.slug }), image: items[0]?.images[0] ?? null, count: items.length };
    })
    .filter((t) => t.count > 0);

/** Builds the tile sections for a hub from whatever products are in scope (empty ones are dropped). */
export function buildHub(hub: Hub, all: Product[], categories: Category[]): { products: Product[]; sections: HubSection[] } {
  const products = all.filter((p) => inScope(p, hub.scope));
  const present = categories.filter((c) => products.some((p) => p.category === c.slug));
  const sections: HubSection[] = [];
  const prefix = hub.scope.gender ? `${GENDER_LABEL[hub.scope.gender]} ` : hub.scope.sale ? "Sale " : "";

  if (!hub.scope.category) {
    sections.push({
      title: "Shop by Category",
      variant: "feature",
      tiles: present.map((c) => ({
        label: `${prefix}${c.name}`,
        href: shopHref({ ...hub.scope, category: c.slug }),
        image: CATEGORY_PHOTO[c.slug] ? unsplash(CATEGORY_PHOTO[c.slug], 1200) : products.find((p) => p.category === c.slug)?.images[0] ?? null,
        count: products.filter((p) => p.category === c.slug).length,
      })),
    });
    for (const c of present) {
      const tiles = typeTiles(products, hub.scope, c);
      // a lone type tile would just repeat the category tile above it
      if (tiles.length > 1) sections.push({ title: `${prefix}${c.name}`, variant: "grid", tiles });
    }
  } else {
    const category = categories.find((c) => c.slug === hub.scope.category);
    const tiles = category ? typeTiles(products, hub.scope, category) : [];
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
export function listingTitle(
  { gender, category, type, sale }: { gender?: Gender; category?: string; type?: string; sale?: boolean },
  categories: Category[],
) {
  const g = gender && gender !== "unisex" ? `${GENDER_LABEL[gender]} ` : "";
  const t = findSubcategory(categories, type, category);
  const c = category ? categories.find((x) => x.slug === category)?.name ?? category : "";
  if (!t && !c) {
    if (g) return sale ? `${g}Sale` : gender![0].toUpperCase() + gender!.slice(1);
    return sale ? "Sale" : "All Products";
  }
  const core = t ? (t.category.slug === "footwear" ? `${t.name} Shoes` : t.name) : c;
  return `${sale ? "Sale: " : ""}${g}${core}`;
}
