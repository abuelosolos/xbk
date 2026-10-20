import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export function ProductRow({ products, columns = 3 }: { products: Product[]; columns?: 3 | 4 }) {
  return (
    <div className={`grid grid-cols-2 gap-x-2 gap-y-10 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
