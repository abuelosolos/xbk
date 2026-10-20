"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Accordion row: hairline-divided title with a rotating chevron and an animated panel. */
export function Disclosure({
  title,
  children,
  className,
  bodyClassName = "pb-6 text-fs-16 leading-relaxed text-charcoal",
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border-b border-hairline", className)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-6 text-left text-fs-16 font-medium">
        {title}
        <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
            <div className={bodyClassName}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
