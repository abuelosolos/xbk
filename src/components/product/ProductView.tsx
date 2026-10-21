"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FramedImage } from "@/components/product/FramedImage";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { EASE } from "@/lib/motion";
import type { Product } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

export function ProductView({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const shake = useAnimationControls();

  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [view, setView] = useState(0);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Mobile sticky bar: shown while the main Add to Bag button is off screen,
  // hidden again once the footer scrolls in so it never covers footer links.
  useEffect(() => {
    const cta = ctaRef.current;
    const footer = document.querySelector("footer");
    if (!cta) return;
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      setShowBar(!visible.get(cta) && !(footer && visible.get(footer)));
    });
    io.observe(cta);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  const views = product.images.length ? product.images : [null, null, null, null];
  const color = product.colors[colorIdx];
  const unit = product.salePriceKobo ?? product.priceKobo;
  const onSale = product.salePriceKobo !== null;
  const soldOut = product.stock <= 0;

  function addToBag() {
    if (!size) {
      setError(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      image: product.images[0] ?? null,
      unitPriceKobo: unit,
      size,
      color: color?.name ?? "",
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pt-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 lg:px-24 lg:pt-8">
      {/* gallery */}
      <div className="flex flex-col-reverse gap-2 lg:flex-row">
        <ul className="flex gap-2 overflow-x-auto lg:max-h-[calc(100dvh-8rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {views.map((src, i) => (
            <li key={i}>
              <button
                type="button"
                aria-label={`View ${i + 1}`}
                aria-current={view === i}
                onMouseEnter={() => setView(i)}
                onClick={() => setView(i)}
                className={cn("block size-16 shrink-0 overflow-hidden rounded-lg transition lg:size-[60px]", view === i ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100")}
              >
                <FramedImage src={src} label={`${product.name} view ${i + 1}`} className="size-full" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
        <div className="group relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <FramedImage src={views[view]} label={product.name} className="aspect-square rounded-lg lg:aspect-[4/5]" priority sizes="(min-width:1024px) 60vw, 100vw" />
            </motion.div>
          </AnimatePresence>
          {views.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-label={d < 0 ? "Previous image" : "Next image"}
                  onClick={() => setView((v) => (v + d + views.length) % views.length)}
                  className="flex size-10 items-center justify-center rounded-full bg-white text-ink transition hover:bg-cloud active:scale-90"
                >
                  {d < 0 ? <CaretLeft size={18} aria-hidden /> : <CaretRight size={18} aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* details */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        {product.badge && <p className="text-fs-16 font-medium text-sale">{product.badge}</p>}
        <h1 className="text-fs-32 font-medium leading-tight">{product.name}</h1>
        <p className="text-fs-16 text-charcoal">{product.subtitle}</p>
        <p className="mt-3 flex items-baseline gap-3 text-fs-24 font-medium">
          {onSale ? (
            <>
              <span className="text-sale">{formatNaira(product.salePriceKobo!)}</span>
              <span className="text-fs-16 text-mute line-through">{formatNaira(product.priceKobo)}</span>
            </>
          ) : (
            formatNaira(product.priceKobo)
          )}
        </p>

        {product.colors.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-fs-16 font-medium">Colour: <span className="font-normal text-mute">{color?.name}</span></p>
            <ul className="flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <li key={c.name} className="relative">
                  <button type="button" aria-label={c.name} aria-pressed={colorIdx === i} onClick={() => setColorIdx(i)} className="relative block size-10 rounded-full p-[3px] transition active:scale-90">
                    <span className="block size-full rounded-full ring-1 ring-hairline" style={{ backgroundColor: c.hex }} />
                    {colorIdx === i && (
                      <motion.span layoutId="swatch-ring" className="absolute inset-0 rounded-full ring-2 ring-ink" transition={{ duration: 0.3, ease: EASE }} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <motion.div ref={sizeRef} animate={shake} className="mt-8 scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <p className={cn("text-fs-16 font-medium", error && "text-sale")}>{error ? "Please select a size" : "Select Size"}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => { setSize(s); setError(false); }}
                className={cn(
                  "h-12 rounded-pill border text-fs-16 font-medium transition active:scale-95",
                  size === s ? "border-ink bg-ink text-white" : error ? "border-sale" : "border-hairline hover:border-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        <div ref={ctaRef} className="mt-6 flex flex-col gap-3">
          <Button size="lg" disabled={soldOut} onClick={addToBag} className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? "added" : "add"} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }}>
                {soldOut ? "Sold Out" : added ? "Added to Bag" : "Add to Bag"}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>

        <div className="mt-10 border-t border-hairline">
          <Disclosure title="View Product Details"><p>{product.description}</p></Disclosure>
          <Disclosure title="Shipping &amp; Returns"><p>Delivery and returns details will be confirmed at checkout.</p></Disclosure>
          <Disclosure title="Reviews (0)"><p>No reviews yet.</p></Disclosure>
        </div>
      </div>

      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
          >
            <Button size="lg" disabled={soldOut} onClick={addToBag} className="w-full">
              {soldOut ? "Sold Out" : added ? "Added to Bag" : size ? `Add to Bag · ${size}` : "Add to Bag"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
