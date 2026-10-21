"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { FramedImage } from "@/components/product/FramedImage";
import { EASE } from "@/lib/motion";
import { NAV } from "@/lib/nav";
import { formatNaira } from "@/lib/utils";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

interface Hit {
  slug: string;
  name: string;
  subtitle: string;
  image: string | null;
  priceKobo: number;
  salePriceKobo: number | null;
}

/** Desktop search: a full-width white panel under a dimmed page, live product results as you type. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setHits([]);
      setTotal(0);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => {
          setHits(d.results);
          setTotal(d.total);
        })
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const go = (term: string) => {
    onClose();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  };

  // typed part dark, the rest muted
  const suggestions = q.trim()
    ? [...new Set(hits.map((h) => h.name))].slice(0, 4)
    : NAV.map((n) => n.label);
  const term = q.trim();

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
            <Link href="/" onClick={onClose} aria-label="XBK home" className="w-8 shrink-0 text-ink">
              <LogoMark className="w-full" />
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
            <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_minmax(0,2fr)_1fr] lg:gap-8">
              <div>
                <p className="mb-4 text-fs-13 text-mute">Top Suggestions</p>
                <ul className="space-y-2.5">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => go(s)} className="text-left text-fs-16 font-medium leading-tight">
                        {s.toLowerCase().startsWith(term.toLowerCase()) ? (
                          <>
                            <span>{s.slice(0, term.length)}</span>
                            <span className="text-mute">{s.slice(term.length)}</span>
                          </>
                        ) : (
                          s
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-h-[260px] lg:col-span-2">
                {hits.length === 0 ? (
                  <p className="text-fs-14 text-mute">No products match “{term}”.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {hits.map((h) => (
                      <li key={h.slug} className="group min-w-0">
                        <Link href={`/product/${h.slug}`} onClick={onClose} className="block">
                          <FramedImage src={h.image} label={h.name} className="aspect-[4/5] rounded-lg" sizes="20vw" />
                          <p className="mt-3 text-fs-14 font-medium leading-snug">{h.name}</p>
                          <p className="text-fs-14 text-mute">{h.subtitle}</p>
                          <p className="mt-2 flex gap-2 text-fs-14 font-medium">
                            {h.salePriceKobo !== null ? (
                              <>
                                <span className="text-sale">{formatNaira(h.salePriceKobo)}</span>
                                <span className="text-mute line-through">{formatNaira(h.priceKobo)}</span>
                              </>
                            ) : (
                              formatNaira(h.priceKobo)
                            )}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {total > 0 && (
                  <button type="button" onClick={() => go(term)} className="mt-6 text-fs-14 font-medium underline underline-offset-4">
                    View all {total} {total === 1 ? "result" : "results"}
                  </button>
                )}
              </div>
            </div>
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
