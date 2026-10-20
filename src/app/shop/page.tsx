import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { PRICE_BUCKETS, type Filters, type PriceBucket, type SortKey } from "@/lib/filters";
import { getAllProducts } from "@/lib/products";
import type { Gender } from "@/lib/types";

export const metadata: Metadata = { title: "Shop All" };

const GENDERS: Gender[] = ["men", "women", "kids", "unisex"];
const SORTS: SortKey[] = ["featured", "price-asc", "price-desc"];

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const products = await getAllProducts();

  const gender = first(sp.gender) as Gender | undefined;
  const category = first(sp.category);
  const price = first(sp.price) as PriceBucket | undefined;
  const sort = first(sp.sort) as SortKey | undefined;

  const initial: Partial<Filters> = {
    q: first(sp.q) ?? "",
    genders: gender && GENDERS.includes(gender) ? [gender] : [],
    categories: category ? [category] : [],
    saleOnly: first(sp.sale) === "1",
    price: price && PRICE_BUCKETS.some((b) => b.id === price) ? price : "all",
  };

  const title = initial.q
    ? `Results for “${initial.q}”`
    : initial.saleOnly
      ? "Sale"
      : gender && GENDERS.includes(gender)
        ? `${gender[0].toUpperCase()}${gender.slice(1)}`
        : "All Products";

  return (
    <ShopClient
      key={JSON.stringify(sp)}
      products={products}
      initial={initial}
      initialSort={sort && SORTS.includes(sort) ? sort : "featured"}
      title={title}
    />
  );
}
