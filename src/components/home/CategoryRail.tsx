"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";

const TILES = [
  { label: "Footwear", href: "/footwear", photo: "/xbk-court-sneaker-black.jpg" },
  { label: "Jackets", href: "/shop?category=clothing&type=jackets", photo: "/xbk-puffer-jacket-off-white.jpg" },
  { label: "Accessories", href: "/accessories", photo: "/xbk-dad-cap-black.jpg" },
  { label: "Hoodies", href: "/shop?category=clothing&type=hoodies", photo: "/xbk-hoodie-black.jpeg" },
  { label: "Sale", href: "/sale", photo: "/xbk-striped-cardigan-black-cream.jpeg" },
];

/** Horizontal snap rail of 4:5 portrait tiles with a white pill anchored bottom-left. */
export function CategoryRail({ outOfStock = [] }: { /** Tile hrefs with nothing in stock. */ outOfStock?: string[] }) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 lg:mx-0 lg:scroll-px-0 lg:px-0"
    >
      {TILES.map((t) => {
        const out = outOfStock.includes(t.href);
        return (
        <li key={t.label} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-6px)]">
          <Link href={t.href} className="group relative block aspect-[4/5] overflow-hidden bg-ink text-white">
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
              <Image
                src={unsplash(t.photo, 900)}
                alt=""
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 44vw, 72vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink/40" />
            </div>
            <span className="display-campaign absolute left-5 top-5 !text-[clamp(32px,6vw,40px)]">{t.label}</span>
            <span className="absolute bottom-5 left-5 inline-flex h-10 items-center rounded-pill bg-white px-6 text-fs-16 font-medium text-ink transition group-hover:bg-cloud group-active:scale-95">
              {out ? "Out of stock" : "Shop"}
            </span>
          </Link>
        </li>
        );
      })}
    </motion.ul>
  );
}
