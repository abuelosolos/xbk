"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";

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
        <motion.span className="inline-flex" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}><CaretDown size={20} aria-hidden /></motion.span>
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
