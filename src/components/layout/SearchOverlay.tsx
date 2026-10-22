"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ResultsPanel, useSearch } from "@/components/layout/search-parts";
import { EASE } from "@/lib/motion";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

/** Desktop search: a full-width white panel under a dimmed page, live product results as you type. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const { hits, total, term, suggestions, go } = useSearch(q, onClose);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Search"
        className="fixed inset-x-0 top-0 z-[70] h-dvh overflow-y-auto bg-white lg:h-auto lg:max-h-dvh"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className="mx-auto max-w-[1440px] px-4 pb-8 lg:px-12 lg:pb-12">
          <div className="grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pt-2 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] lg:gap-8">
            <Link href="/" onClick={onClose} aria-label="XBK home" className="w-[29px] shrink-0">
              <Logo className="w-full" />
            </Link>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (term) go(term);
              }}
              className="flex h-10 items-center gap-2 rounded-pill bg-cloud px-3"
            >
              <MagnifyingGlass size={20} aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-fs-14 outline-none placeholder:text-mute"
              />
              {q && (
                <button type="button" aria-label="Clear search" onClick={() => { setQ(""); inputRef.current?.focus(); }} className="flex size-7 items-center justify-center rounded-full transition hover:bg-hairline">
                  <X size={16} aria-hidden />
                </button>
              )}
            </form>
            <button type="button" onClick={onClose} className="justify-self-end text-fs-14 font-medium">
              Cancel
            </button>
          </div>

          {term ? (
            <ResultsPanel term={term} hits={hits} total={total} suggestions={suggestions} go={go} onClose={onClose} />
          ) : (
            <div className="mt-6 grid min-h-[160px] lg:mt-8 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] lg:gap-8">
              <div className="lg:col-start-2">
                <p className="mb-4 text-fs-13 text-mute">Popular Search Terms</p>
                <ul className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => go(s)} className="h-9 rounded-pill bg-cloud px-4 text-fs-14 font-medium transition hover:bg-hairline active:scale-95">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
