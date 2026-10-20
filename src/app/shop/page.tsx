import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { findHub, findType, listingTitle } from "@/lib/collections";
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
  const type = findType(first(sp.type))?.slug;
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
    : listingTitle({ gender: validGender, category, type, sale: initial.saleOnly });

  // breadcrumb back to the hub pages this listing sits under
  const crumbs = [validGender && findHub(validGender), category && findHub(category), initial.saleOnly && findHub("sale")]
    .filter((h): h is NonNullable<ReturnType<typeof findHub>> => !!h)
    .map((h) => ({ label: h.title, href: `/${h.slug}` }));

  return (
    <ShopClient
      key={JSON.stringify(sp)}
      products={products}
      initial={initial}
      initialSort={sort && SORTS.includes(sort) ? sort : "featured"}
      title={title}
      crumbs={initial.q ? [] : crumbs}
    />
  );
}
