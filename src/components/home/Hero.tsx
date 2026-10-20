"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";

const LINES = ["Built", "to move."];

/**
 * Campaign tile: full-bleed black-and-white campaign photo with a 96px uppercase
 * headline. A bottom-up ink gradient keeps the white type legible.
 */
export function Hero() {
  return (
    <section className="relative isolate flex h-[min(82vh,760px)] min-h-[480px] items-end overflow-hidden bg-ink text-white">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <Image
          src={unsplash("_1BshZ602EM", 2000)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
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
          className="mt-4 max-w-md text-fs-16 text-stone"
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
