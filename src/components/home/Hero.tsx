"use client";

import { motion } from "motion/react";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";

const LINES = ["Built", "to move."];

/**
 * Campaign tile: full-bleed black stage with a 96px uppercase headline.
 * Swap the background layer for campaign photography when it's ready.
 */
export function Hero() {
  return (
    <section className="relative isolate flex h-[min(82vh,760px)] min-h-[480px] items-end overflow-hidden bg-ink text-white">
      <motion.div
        aria-hidden
        className="absolute -right-[8%] top-1/2 -z-10 w-[70%] max-w-[900px] -translate-y-1/2 text-white/10"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <LogoMark className="w-full" />
      </motion.div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 lg:px-12 lg:pb-16">
        <h1 className="display-campaign">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-4 max-w-md text-[16px] text-stone"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
        >
          Footwear, clothing and accessories in black and white. Nothing extra.
        </motion.p>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.72, ease: EASE }}
        >
          <ButtonLink href="/shop" variant="outline">Shop Now</ButtonLink>
        </motion.div>
      </div>
    </section>
  );
}
