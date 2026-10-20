"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { FilterPanel, type Facets } from "@/components/shop/FilterPanel";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { EASE } from "@/lib/motion";
import type { Product } from "@/lib/types";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low–High" },
  { id: "price-desc", label: "Price: High–Low" },
];

export function ShopClient({
  products,
  initial,
  initialSort = "featured",
  title = "All Products",
}: {
  products: Product[];
  initial: Partial<Filters>;
  initialSort?: SortKey;
  title?: string;
}) {
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, ...initial });
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [showFilters, setShowFilters] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const facets = useMemo<Facets>(() => {
    const colors = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => colors.set(c.name, c.hex)));
    return {
      genders: [...new Set(products.map((p) => p.gender))],
      categories: [...new Set(products.map((p) => p.category))],
      sizes: [...new Set(products.flatMap((p) => p.sizes))],
      colors: [...colors].map(([name, hex]) => ({ name, hex })),
    };
  }, [products]);

  const results = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);
  const count = activeFilterCount(filters);
  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const clear = () => setFilters({ ...EMPTY_FILTERS });

  const panel = <FilterPanel facets={facets} filters={filters} onChange={patch} />;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 lg:px-12">
      <div className="sticky top-16 z-30 -mx-4 flex items-center justify-between gap-4 border-b border-hairline-soft bg-white px-4 py-4 lg:-mx-12 lg:px-12">
        <h1 className="text-[24px] font-medium leading-tight">
          {title} <span className="text-mute">({results.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="hidden h-10 items-center gap-2 rounded-pill px-4 text-[16px] font-medium transition hover:bg-cloud lg:flex"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 items-center gap-2 rounded-pill border border-hairline px-4 text-[14px] font-medium lg:hidden"
          >
            Filters{count > 0 && ` (${count})`}
          </button>

          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((o) => !o)}
              className="flex h-10 items-center gap-2 rounded-pill px-4 text-[14px] font-medium transition hover:bg-cloud lg:text-[16px]"
            >
              Sort By
              <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden animate={{ rotate: sortOpen ? 180 : 0 }}>
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute right-0 top-12 z-40 w-48 bg-white py-2 shadow-[0_0_0_1px_#e5e5e5]"
                >
                  {SORTS.map((s) => (
                    <li key={s.id} role="option" aria-selected={sort === s.id}>
                      <button
                        type="button"
                        onClick={() => { setSort(s.id); setSortOpen(false); }}
                        className={`block w-full px-4 py-2 text-left text-[14px] hover:bg-cloud ${sort === s.id ? "font-medium" : "text-mute"}`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex pt-6">
        {/* desktop filter rail: width animates when toggled */}
        <motion.aside
          initial={false}
          animate={{ width: showFilters ? 240 : 0, marginRight: showFilters ? 32 : 0, opacity: showFilters ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="hidden shrink-0 overflow-hidden lg:block"
          aria-hidden={!showFilters}
        >
          <div className="w-[240px]">
            {count > 0 && (
              <button type="button" onClick={clear} className="mb-2 text-[14px] font-medium underline underline-offset-4">
                Clear all ({count})
              </button>
            )}
            {panel}
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-[24px] font-medium">No products match</p>
              <p className="text-[16px] text-mute">Try removing a filter or two.</p>
              <Button variant="secondary" onClick={clear}>Clear filters</Button>
            </div>
          ) : (
            <motion.div layout className={`grid grid-cols-2 gap-x-2 gap-y-10 ${showFilters ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              <AnimatePresence>
                {results.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="f-backdrop"
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="f-drawer"
              className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] flex-col bg-white lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[24px] font-medium">Filters</h2>
                <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-full bg-cloud">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">{panel}</div>
              <div className="flex gap-2 border-t border-hairline-soft p-4">
                <Button variant="secondary" className="flex-1" onClick={clear}>Clear</Button>
                <Button className="flex-1" onClick={() => setMobileOpen(false)}>View {results.length}</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
