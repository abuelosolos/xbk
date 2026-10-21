"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";

/** Hub campaign banner: photo, ink gradient, 96px headline lockup and Shop All pill. */
export function HubHero({ title, blurb, photo, href }: { title: string; blurb: string; photo: string; href: string }) {
  return (
    <section className="relative isolate flex h-[min(64vh,600px)] min-h-[420px] items-end overflow-hidden bg-ink text-white">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <Image src={unsplash(photo, 2000)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
      </motion.div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 lg:px-12 lg:pb-14">
        <h1 className="display-campaign overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            {title}
          </motion.span>
        </h1>
        <motion.p
          className="mt-3 max-w-md text-fs-16 text-stone"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
        >
          {blurb}
        </motion.p>
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
        >
          <ButtonLink href={href} variant="outline">Shop All</ButtonLink>
        </motion.div>
      </div>
    </section>
  );
}
