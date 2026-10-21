"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { unsplash } from "@/lib/images";
import { EASE } from "@/lib/motion";

const LINES = ["Built", "to move."];
// colour motion-blur race photos; the carousel advances every 3 seconds
const SLIDES = ["iZgfvYwo69Q", "OpDIYfAb4WQ", "QjG2dna1Ll8", "WAAkGFbZUus"];
const INTERVAL = 3000;

/**
 * Campaign tile: full-bleed colour campaign photo carousel with a 96px uppercase
 * headline. A bottom-up ink gradient keeps the white type legible.
 */
export function Hero() {
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const go = (d: number) => setSlide(([i]) => [(i + d + SLIDES.length) % SLIDES.length, d]);

  // restarts after every change, so a manual swipe gets a full 3 seconds too
  useEffect(() => {
    const t = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <section className="relative isolate flex h-[calc(100dvh-3.5rem)] min-h-[480px] items-end overflow-hidden bg-ink text-white">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={index}
          custom={dir}
          className="absolute inset-0 -z-10 touch-pan-y"
          variants={{
            enter: (d: number) => ({ x: `${d * 100}%` }),
            center: { x: 0 },
            exit: (d: number) => ({ x: `${d * -100}%` }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: EASE }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -60 || velocity.x < -400) go(1);
            else if (offset.x > 60 || velocity.x > 400) go(-1);
          }}
        >
          <Image
            src={unsplash(SLIDES[index], 2000)}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            draggable={false}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
        </motion.div>
      </AnimatePresence>

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

      <div className="absolute bottom-4 right-4 flex gap-2 lg:bottom-16 lg:right-12" role="tablist" aria-label="Hero slides">
        {SLIDES.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setSlide([i, i >= index ? 1 : -1])}
            className={`h-1.5 rounded-full bg-white transition-all duration-300 ${i === index ? "w-6" : "w-1.5 opacity-50"}`}
          />
        ))}
      </div>
    </section>
  );
}
