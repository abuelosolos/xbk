"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FramedImage } from "@/components/product/FramedImage";
import { EASE } from "@/lib/motion";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
  showPrice = false,
  reflow = false,
}: {
  product: Product;
  index?: number;
  showPrice?: boolean;
  /** Animate position changes; only the filterable shop grid needs it (it makes scroll reveals janky elsewhere). */
  reflow?: boolean;
}) {
  const soldOut = product.stock <= 0;
  const onSale = product.salePriceKobo !== null;
  const percentOff = onSale
    ? Math.round(((product.priceKobo - product.salePriceKobo!) / product.priceKobo) * 100)
    : 0;

  return (
    <motion.article
      layout={reflow}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.05, ease: EASE }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {/* overflow-hidden keeps the hidden size strip inside the image instead of covering the text below */}
        <div className="relative overflow-hidden">
          <FramedImage src={product.images[0]} label={product.name} className="aspect-[4/5]" />

          {(soldOut || product.badge) && (
            <span className="absolute left-4 top-4 z-20 rounded-pill border border-hairline bg-white px-3 py-1 text-fs-12 font-medium">
              {soldOut ? "Sold out" : product.badge}
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
