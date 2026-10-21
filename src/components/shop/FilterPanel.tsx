"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { PRICE_BUCKETS, type Filters, type PriceBucket } from "@/lib/filters";
import { EASE } from "@/lib/motion";
import type { Gender } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";

export interface Facets {
  genders: Gender[];
  categories: { slug: string; name: string }[];
  types: { slug: string; name: string }[];
  sizes: string[];
  colors: { name: string; hex: string }[];
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type FilterGroup = "gender" | "price" | "sale";

function Group({ title, children, defaultOpen = true, bare = false }: { title: string; children: ReactNode; defaultOpen?: boolean; bare?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  // single-group popup: the sheet header already names it, so skip the accordion chrome
  if (bare) return <div className="pb-2">{children}</div>;
  return (
    <div className="border-b border-hairline py-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-fs-16 font-medium"
      >
        {title}
        <motion.span className="inline-flex" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}><CaretDown size={18} aria-hidden /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterPanel({
  facets,
  filters,
  onChange,
  only,
}: {
  facets: Facets;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  /** render just one group (the pill popups on mobile) */
  only?: FilterGroup;
}) {
  const bare = !!only;
  return (
    <div>
      {(!only || only === "gender") && (
      <Group title="Gender" bare={bare}>
        <ul className="space-y-2">
          {facets.genders.map((g) => (
            <li key={g}>
              <label className="flex cursor-pointer items-center gap-3 text-fs-16">
                <input type="checkbox" className="size-4 accent-ink" checked={filters.genders.includes(g)} onChange={() => onChange({ genders: toggle(filters.genders, g) })} />
                {label(g)}
              </label>
            </li>
          ))}
        </ul>
      </Group>
      )}

      {!only && (<>
      <Group title="Category">
        <ul className="space-y-2">
          {facets.categories.map((c) => (
            <li key={c.slug}>
              <label className="flex cursor-pointer items-center gap-3 text-fs-16">
                <input type="checkbox" className="size-4 accent-ink" checked={filters.categories.includes(c.slug)} onChange={() => onChange({ categories: toggle(filters.categories, c.slug) })} />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </Group>

      {facets.types.length > 0 && (
        <Group title="Type">
          <ul className="space-y-2">
            {facets.types.map((t) => (
              <li key={t.slug}>
                <label className="flex cursor-pointer items-center gap-3 text-fs-16">
                  <input type="checkbox" className="size-4 accent-ink" checked={filters.types.includes(t.slug)} onChange={() => onChange({ types: toggle(filters.types, t.slug) })} />
                  {t.name}
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}

      </>)}

      {(!only || only === "sale") && (
      <Group title="Sale &amp; Offers" bare={bare}>
        <label className="flex cursor-pointer items-center gap-3 text-fs-16">
          <input type="checkbox" className="size-4 accent-ink" checked={filters.saleOnly} onChange={() => onChange({ saleOnly: !filters.saleOnly })} />
          Sale
        </label>
      </Group>
      )}

      {!only && (<>

      <Group title="Size">
        <div className="grid grid-cols-3 gap-2">
          {facets.sizes.map((s) => {
            const on = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ sizes: toggle(filters.sizes, s) })}
                className={cn(
                  "h-10 rounded-pill border text-fs-14 font-medium transition active:scale-95",
                  on ? "border-ink bg-ink text-white" : "border-hairline bg-white hover:border-ink",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Colour">
        <ul className="flex flex-wrap gap-3">
          {facets.colors.map((c) => {
            const on = filters.colors.includes(c.name);
            return (
              <li key={c.name}>
                <button
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={on}
                  onClick={() => onChange({ colors: toggle(filters.colors, c.name) })}
                  className={cn("flex size-8 items-center justify-center rounded-full ring-2 ring-offset-2 transition active:scale-90", on ? "ring-ink" : "ring-transparent")}
                >
                  <span className="size-full rounded-full ring-1 ring-hairline" style={{ backgroundColor: c.hex }} />
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      </>)}

      {(!only || only === "price") && (
      <Group title="Shop by Price" bare={bare}>
        <ul className="space-y-2">
          {PRICE_BUCKETS.map((b) => (
            <li key={b.id}>
              <label className="flex cursor-pointer items-center gap-3 text-fs-16">
                <input type="radio" name="price" className="size-4 accent-ink" checked={filters.price === b.id} onChange={() => onChange({ price: b.id as PriceBucket })} />
                {b.label}
              </label>
            </li>
          ))}
        </ul>
      </Group>
      )}
    </div>
  );
}
