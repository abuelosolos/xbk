"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FramedImage } from "@/components/product/FramedImage";
import { EASE } from "@/lib/motion";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function CartLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <ul className="divide-y divide-hairline-soft">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.key}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 py-5">
              <FramedImage
                src={item.image}
                label={item.name}
                sizes="144px"
                className={compact ? "size-24 shrink-0" : "size-28 shrink-0 sm:size-36"}
                inset={compact ? 6 : 8}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/product/${item.slug}`} onClick={onNavigate} className="text-[16px] font-medium leading-snug hover:underline">
                    {item.name}
                  </Link>
                  <span className="text-[16px] font-medium">{formatNaira(item.unitPriceKobo * item.qty)}</span>
                </div>
                <p className="text-[14px] text-mute">{item.subtitle}</p>
                <p className="text-[14px] text-mute">
                  {item.color && `${item.color} · `}Size {item.size}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-3">
                  <div className="flex h-9 items-center rounded-pill border border-hairline">
                    <button type="button" aria-label="Decrease quantity" className="flex size-9 items-center justify-center rounded-full transition hover:bg-cloud" onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                    <motion.span key={item.qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-[14px] font-medium">{item.qty}</motion.span>
                    <button type="button" aria-label="Increase quantity" className="flex size-9 items-center justify-center rounded-full transition hover:bg-cloud" onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                  </div>
                  <button type="button" onClick={() => remove(item.key)} className="text-[14px] font-medium text-mute underline underline-offset-2 transition hover:text-ink">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
