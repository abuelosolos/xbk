"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { LogoMark } from "@/components/brand/Logo";
import { EASE } from "@/lib/motion";

const TILES = [
  { label: "Footwear", href: "/shop?category=footwear", tone: "bg-ink" },
  { label: "Clothing", href: "/shop?category=clothing", tone: "bg-charcoal" },
  { label: "Accessories", href: "/shop?category=accessories", tone: "bg-ash" },
  { label: "Kids", href: "/shop?gender=kids", tone: "bg-ink" },
  { label: "Sale", href: "/shop?sale=1", tone: "bg-charcoal" },
];

/** Horizontal snap rail of 4:5 portrait tiles with a white pill anchored bottom-left. */
export function CategoryRail() {
  return (
    <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      {TILES.map((t, i) => (
        <motion.li
          key={t.label}
          className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-6px)]"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
        >
          <Link href={t.href} className={`group relative block aspect-[4/5] overflow-hidden text-white ${t.tone}`}>
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-110">
              <LogoMark className="w-1/2 text-white/10" />
            </div>
            <span className="display-campaign absolute left-5 top-5 !text-[40px]">{t.label}</span>
            <span className="absolute bottom-5 left-5 inline-flex h-10 items-center rounded-pill bg-white px-6 text-[16px] font-medium text-ink transition group-hover:bg-cloud group-active:scale-95">
              Shop
            </span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
