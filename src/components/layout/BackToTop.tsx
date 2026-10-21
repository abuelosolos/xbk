"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "@/lib/motion";
import { ArrowFatUp } from "@phosphor-icons/react";

/** Mobile only: once well down the page, scrolling up a little raises a round button that jumps back to the top. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 600) setShow(false);
      else if (y < last - 4) setShow(true);
      else if (y > last + 4) setShow(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShow(false);
          }}
          className="fixed bottom-8 left-1/2 z-40 flex size-12 -translate-x-1/2 items-center justify-center raised-dark rounded-full bg-ink text-white lg:hidden"
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.8 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <ArrowFatUp size={22} weight="fill" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
