"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FramedImage } from "@/components/product/FramedImage";
import { NAV } from "@/lib/nav";
import { formatNaira } from "@/lib/utils";

export interface Hit {
  slug: string;
  name: string;
  subtitle: string;
  image: string | null;
  priceKobo: number;
  salePriceKobo: number | null;
}

/** Live product search (debounced `/api/search`) plus the suggestion list and navigation helper both search UIs share. */
export function useSearch(q: string, onClose: () => void) {
  const router = useRouter();
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);

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

  const term = q.trim();
  const suggestions = term ? [...new Set(hits.map((h) => h.name))].slice(0, 4) : NAV.map((n) => n.label);
  return { hits, total, term, suggestions, go };
}

/** Suggestions + product grid shown once something has been typed. */
export function ResultsPanel({
  term,
  hits,
  total,
  suggestions,
  go,
  onClose,
}: {
  term: string;
  hits: Hit[];
  total: number;
  suggestions: string[];
  go: (term: string) => void;
  onClose: () => void;
}) {
  return (
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
  );
}
