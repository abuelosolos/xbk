"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FramedImage } from "@/components/product/FramedImage";
import { EASE } from "@/lib/motion";
import { MOCK_PRODUCTS } from "@/db/mock-products";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

// TEMP: every card shows the Vector Trainer (image, copy, price) while real photos are pending; links keep the real slug.
const PLACEHOLDER = MOCK_PRODUCTS.find((p) => p.slug === "vector-trainer")!;

export function ProductCard({
  product: real,
  index = 0,
  showPrice = false,
}: {
  product: Product;
  index?: number;
  showPrice?: boolean;
}) {
  const product = { ...PLACEHOLDER, id: real.id, slug: real.slug };
  const onSale = product.salePriceKobo !== null;
  const percentOff = onSale
    ? Math.round(((product.priceKobo - product.salePriceKobo!) / product.priceKobo) * 100)
    : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: EASE }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {/* overflow-hidden keeps the hidden size strip inside the image instead of covering the text below */}
        <div className="relative overflow-hidden">
          <FramedImage src={product.images[0]} label={product.name} className="aspect-[4/5]" />

          {product.badge && (
            <span className="absolute left-4 top-4 z-20 rounded-pill border border-hairline bg-white px-3 py-1 text-fs-12 font-medium">
              {product.badge}
            </span>
          )}

          {/* sizes slide up on hover */}
          <div className="absolute inset-x-0 bottom-0 z-20 hidden translate-y-full truncate bg-white/95 px-5 py-3 text-fs-12 font-medium transition-transform duration-300 ease-out group-hover:translate-y-0 md:block">
            <span className="text-mute">Sizes </span>
            {product.sizes.slice(0, 6).join("  ")}
            {product.sizes.length > 6 && "  …"}
          </div>
        </div>

        <div className="min-w-0 space-y-0.5 px-4 pb-6 pt-4">
          <h3 className="truncate text-fs-16 font-medium leading-snug">{product.name}</h3>
          <p className="truncate text-fs-14 text-mute">{product.subtitle}</p>
          {showPrice && (
            <p className="flex flex-wrap items-baseline gap-x-2 pt-1 text-fs-14 font-medium">
              {onSale ? (
                <>
                  <span className="text-sale">{formatNaira(product.salePriceKobo!)}</span>
                  <span className="text-mute line-through">{formatNaira(product.priceKobo)}</span>
                  <span className="text-sale">{percentOff}% off</span>
                </>
              ) : (
                formatNaira(product.priceKobo)
              )}
            </p>
          )}
          {product.colors.length > 1 && (
            <ul className="flex pt-3 items-center gap-2" aria-label="Available colours">
              {product.colors.slice(0, 5).map((c) => (
                <li
                  key={c.name}
                  title={c.name}
                  className="size-3 rounded-full ring-1 ring-hairline"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </ul>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
