"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { FramedImage } from "@/components/product/FramedImage";
import type { HubSection } from "@/lib/collections";
import { EASE } from "@/lib/motion";

const styles = (n: number) => `${n} ${n === 1 ? "style" : "styles"}`;

/**
 * "feature": large 4:5 lifestyle photos, swipeable rail on mobile, 2–3 up on desktop.
 * "grid": product-shot tiles on the studio gray, 2 up on mobile, 4 up on desktop.
 * Both put the label under the photo with a "Shop" link, so the photo stays clean.
 */
export function HubTiles({ section }: { section: HubSection }) {
  const { tiles, variant } = section;

  if (variant === "feature") {
    return (
      <ul
        className={`scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:overflow-visible md:px-0 ${
          tiles.length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {tiles.map((t, i) => (
          <motion.li
            key={t.href}
            className="w-[80%] shrink-0 snap-start sm:w-[48%] md:w-auto"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
          >
            <Link href={t.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <div className="relative aspect-[4/5] overflow-hidden bg-cloud">
                {t.image && (
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="(min-width:768px) 33vw, 80vw"
                    className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[24px] font-medium leading-tight">{t.label}</h3>
                  <p className="mt-1 text-[16px] text-mute">{styles(t.count)}</p>
                </div>
                <span className="inline-flex h-10 shrink-0 items-center rounded-pill bg-ink px-6 text-[16px] font-medium text-white transition group-hover:bg-charcoal group-active:scale-95">
                  Shop
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-8 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <motion.li
          key={t.href}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: EASE }}
        >
          <Link href={t.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <FramedImage src={t.image} label={t.label} className="aspect-square" sizes="(min-width:1024px) 25vw, 50vw" />
            <h3 className="mt-3 truncate text-[16px] font-medium leading-snug group-hover:underline group-hover:underline-offset-4">{t.label}</h3>
            <p className="text-[14px] font-medium text-mute">{styles(t.count)}</p>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
