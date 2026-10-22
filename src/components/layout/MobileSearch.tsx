"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ResultsPanel, useSearch } from "@/components/layout/search-parts";
import { EASE } from "@/lib/motion";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

/** Height of the on-screen keyboard (0 when closed or when the browser resizes the page itself). */
function useKeyboardHeight() {
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKb(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return kb;
}

/**
 * Phone search (below md). Rendered inside the navbar: a white row covers the bar's controls while the
 * field grows leftward from the search icon and the X closes it. Results sit in a sheet under the bar;
 * with an empty field the popular pills are docked just above the keyboard.
 */
export function MobileSearch({ onClose }: { onClose: () => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [top, setTop] = useState(56);
  const [mounted, setMounted] = useState(false);
  const kb = useKeyboardHeight();
  const { hits, total, term, suggestions, go } = useSearch(q, onClose);

  useEffect(() => {
    setMounted(true);
    // the sheet starts right under the bar, wherever the bar currently sits
    setTop(Math.round(rowRef.current?.getBoundingClientRect().bottom ?? 56));
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        ref={rowRef}
        className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-2 bg-white px-[26px] md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex min-w-0 flex-1 justify-end">
          <motion.form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (term) go(term);
            }}
            className="flex h-9 items-center gap-2 overflow-hidden rounded-pill bg-cloud px-[10px]"
            initial={{ width: 36 }}
            animate={{ width: "100%" }}
            exit={{ width: 36 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <MagnifyingGlass size={20} className="shrink-0" aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-fs-16 outline-none placeholder:text-mute"
            />
          </motion.form>
        </div>
        <button type="button" onClick={onClose} aria-label="Close search" className="flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-cloud active:scale-90">
          <X size={20} aria-hidden />
        </button>
      </motion.div>

      {/* portalled: the header is transformed, which would break fixed positioning inside it */}
      {mounted &&
        createPortal(
          <motion.div
            role="dialog"
            aria-label="Search"
            className="fixed inset-x-0 z-[55] flex flex-col bg-white md:hidden"
            style={{ top, bottom: kb }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
              {term && <ResultsPanel term={term} hits={hits} total={total} suggestions={suggestions} go={go} onClose={onClose} />}
            </div>
            {!term && (
              <div className="px-4 pb-3 pt-2">
                <p className="mb-2 text-fs-13 text-mute">Popular Search Terms</p>
                <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {suggestions.map((s) => (
                    <li key={s} className="shrink-0">
                      <button type="button" onClick={() => go(s)} className="h-9 rounded-pill bg-cloud px-4 text-fs-14 font-medium transition active:scale-95">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>,
          document.body,
        )}
    </>
  );
}
