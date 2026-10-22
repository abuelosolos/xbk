import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { findSubcategory, listingTitle } from "@/lib/collections";
import { PRICE_BUCKETS, type Filters, type PriceBucket, type SortKey } from "@/lib/filters";
import { getAllProducts, getCategories } from "@/lib/products";
import type { Gender } from "@/lib/types";

export const metadata: Metadata = { title: "Shop All" };

const GENDERS: Gender[] = ["men", "women", "unisex"];
const SORTS: SortKey[] = ["featured", "price-asc", "price-desc"];

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  const gender = first(sp.gender) as Gender | undefined;
  const category = first(sp.category);
  const type = findSubcategory(categories, first(sp.type), first(sp.category))?.slug;
  const price = first(sp.price) as PriceBucket | undefined;
  const sort = first(sp.sort) as SortKey | undefined;

  const initial: Partial<Filters> = {
    q: first(sp.q) ?? "",
    genders: gender && GENDERS.includes(gender) ? [gender] : [],
    categories: category ? [category] : [],
    types: type ? [type] : [],
    saleOnly: first(sp.sale) === "1",
    price: price && PRICE_BUCKETS.some((b) => b.id === price) ? price : "all",
  };

  const validGender = gender && GENDERS.includes(gender) ? gender : undefined;
  const title = initial.q
    ? `Results for “${initial.q}”`
    : listingTitle({ gender: validGender, category, type, sale: initial.saleOnly }, categories);

  return (
    <ShopClient
      key={JSON.stringify(sp)}
      products={products}
      categories={categories}
      initial={initial}
      initialSort={sort && SORTS.includes(sort) ? sort : "featured"}
      title={title}
    />
  );
}
