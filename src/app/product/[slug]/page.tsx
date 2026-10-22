import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/home/ProductRow";
import { ProductView } from "@/components/product/ProductView";
import { getAllProducts, getProductBySlug } from "@/lib/products";

// Admin actions revalidate on change; this is the backstop for anything they miss.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getAllProducts())
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    // bottom padding clears the fixed Add to Bag bar on phones; there is no footer here
    <div className="pb-28 lg:pb-20">
      <ProductView product={product} />
      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-[1440px] px-4 lg:mt-20 lg:px-12">
          <h2 className="mb-6 text-fs-24 font-medium">You Might Also Like</h2>
          <ProductRow products={related} columns={4} />
        </section>
      )}
    </div>
  );
}
