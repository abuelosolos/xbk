"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { FilterPanel, type Facets, type FilterGroup } from "@/components/shop/FilterPanel";
import {
  EMPTY_FILTERS,
  activeFilterCount,
  applyFilters,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { EASE } from "@/lib/motion";
import type { Category, Product } from "@/lib/types";
import { CaretDown, SlidersHorizontal, X } from "@phosphor-icons/react";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low–High" },
  { id: "price-desc", label: "Price: High–Low" },
];

function Pill({ label, n }: { label: string; n: number }) {
  return (
    <>
      {label}
      {n > 0 && ` (${n})`}
      <CaretDown size={16} aria-hidden />
    </>
  );
}

export function ShopClient({
  products,
  categories,
  initial,
  initialSort = "featured",
  title = "All Products",
}: {
  products: Product[];
  categories: Category[];
  initial: Partial<Filters>;
  initialSort?: SortKey;
  title?: string;
}) {
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, ...initial });
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [showFilters, setShowFilters] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  // which pill opened the sheet: one group, or null for every filter
  const [onlyGroup, setOnlyGroup] = useState<FilterGroup | null>(null);
  const openSheet = (g: FilterGroup | null) => { setOnlyGroup(g); setMobileOpen(true); };
  const [sortOpen, setSortOpen] = useState(false);

  const facets = useMemo<Facets>(() => {
    const colors = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => colors.set(c.name, c.hex)));
    return {
      genders: [...new Set(products.map((p) => p.gender))],
      categories: categories.filter((c) => products.some((p) => p.category === c.slug)).map(({ slug, name }) => ({ slug, name })),
      // sub-categories that have products; one entry per slug even if two categories share it
      types: [
        ...new Map(
          categories.flatMap((c) => c.subcategories.filter((s) => products.some((p) => p.category === c.slug && p.subcategory === s.slug))).map((s) => [s.slug, s]),
        ).values(),
      ],
      sizes: [...new Set(products.flatMap((p) => p.sizes))],
      colors: [...colors].map(([name, hex]) => ({ name, hex })),
    };
  }, [products, categories]);

  const results = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);
  const count = activeFilterCount(filters);
  // the page title describes the URL's search; once it is cleared here, fall back
  const heading = !filters.q && initial.q ? "All Products" : title;
  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const clear = () => setFilters({ ...EMPTY_FILTERS });

  const sortMenu = (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={sortOpen}
        onClick={() => setSortOpen((o) => !o)}
        className="relative z-20 flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill px-4 text-fs-14 font-medium transition hover:bg-cloud lg:text-fs-16"
      >
        Sort By
        <motion.span className="inline-flex" animate={{ rotate: sortOpen ? 180 : 0 }}><CaretDown size={16} aria-hidden /></motion.span>
      </button>
      {/* same treatment as the mobile menu: dimmed page, rounded white sheet popping from the corner, rows sliding in */}
      <AnimatePresence>
        {sortOpen && (
          <>
            <motion.div
              key="sort-backdrop"
              className="fixed inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSortOpen(false)}
            />
            <motion.ul
              key="sort-menu"
              role="listbox"
              className="absolute right-0 top-0 z-10 w-52 origin-top-right rounded-[24px] bg-white p-3 pt-14"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE, staggerChildren: 0.05, delayChildren: 0.2 } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18, ease: EASE } }}
            >
              {SORTS.map((s) => (
                <motion.li
                  key={s.id}
                  role="option"
                  aria-selected={sort === s.id}
                  variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } } }}
                  initial="hidden"
                  animate="show"
                >
                  <button
                    type="button"
                    onClick={() => { setSort(s.id); setSortOpen(false); }}
                    className={`flex w-full items-center rounded-xl px-2 py-1.5 text-left text-fs-14 transition hover:bg-cloud active:scale-[0.98] ${sort === s.id ? "font-medium" : "font-medium text-mute"}`}
                  >
                    {s.label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const panel = <FilterPanel facets={facets} filters={filters} onChange={patch} />;
  const sheetPanel = <FilterPanel facets={facets} filters={filters} onChange={patch} only={onlyGroup ?? undefined} />;
  const SHEET_TITLES = { gender: "Gender", price: "Shop By Price", sale: "Sale & Offers" } as const;

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-4 lg:px-12 lg:pt-8">
      {/* mobile: title row, then a sticky strip of filter pills (each opens the filter drawer) */}
      <div className="-mx-4 lg:hidden">
        <div className="relative z-40 flex items-center justify-between gap-4 border-b border-hairline-soft bg-white px-4 pb-4">
          <div className="min-w-0">
            <h1 className="text-fs-16 font-medium leading-tight">
              {heading} <span className="text-mute">({results.length})</span>
            </h1>
          </div>
          {sortMenu}
        </div>
        <div className="sticky top-14 z-30 transition-[top] duration-300 [html[data-nav=hidden]_&]:top-0 flex gap-2 overflow-x-auto border-b border-hairline-soft bg-white px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { key: "all", group: null, node: (
              <>
                <SlidersHorizontal size={20} aria-hidden />
                {count > 0 && `(${count})`}
              </>
            ) },
            { key: "gender", group: "gender" as const, node: <Pill label="Gender" n={filters.genders.length} /> },
            { key: "price", group: "price" as const, node: <Pill label="Shop By Price" n={filters.price !== "all" ? 1 : 0} /> },
            { key: "sale", group: "sale" as const, node: <Pill label="Sale & Offers" n={filters.saleOnly ? 1 : 0} /> },
          ].map((b) => (
            <button
              key={b.key}
              type="button"
              aria-label={b.key === "all" ? "All filters" : undefined}
              onClick={() => openSheet(b.group)}
              className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-ink px-4 text-fs-14 font-medium"
            >
              {b.node}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-14 z-30 transition-[top] duration-300 [html[data-nav=hidden]_&]:top-0 -mx-4 hidden items-center justify-between gap-4 border-b border-hairline-soft bg-white px-4 py-4 lg:-mx-12 lg:flex lg:px-12">
        <div className="min-w-0">
          <h1 className="text-fs-24 font-medium leading-tight">
            {heading} <span className="text-mute">({results.length})</span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="hidden h-10 items-center gap-2 rounded-pill px-4 text-fs-16 font-medium transition hover:bg-cloud lg:flex"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
            <SlidersHorizontal size={18} aria-hidden />
          </button>
          {sortMenu}
        </div>
      </div>

      <div className="flex pt-0 lg:pt-6">
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
              <button type="button" onClick={clear} className="mb-2 text-fs-14 font-medium underline underline-offset-4">
                Clear all ({count})
              </button>
            )}
            {panel}
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-fs-24 font-medium">{filters.q ? `No products match “${filters.q}”` : "No products match"}</p>
              <p className="text-fs-16 text-mute">{filters.q ? "Try a different word or remove a filter." : "Try removing a filter or two."}</p>
              <Button variant="secondary" onClick={clear}>Clear filters</Button>
            </div>
          ) : (
            <motion.div layout className={`-mx-4 grid grid-cols-2 gap-px lg:mx-0 ${showFilters ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              <AnimatePresence>
                {results.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} showPrice />
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
              className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] flex-col rounded-t-[24px] bg-white lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-fs-24 font-medium">{onlyGroup ? SHEET_TITLES[onlyGroup] : "Filters"}</h2>
                <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-full bg-cloud"><X size={18} aria-hidden /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">{sheetPanel}</div>
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
