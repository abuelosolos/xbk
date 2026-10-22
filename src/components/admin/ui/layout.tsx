import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Admin primitives. Values follow the Polaris-style scale in DESIGN.md: 4 label gap, 8 cell/button,
 * 12 button inline, 16 card padding and field gaps, 24 section gaps, 32 page padding. Flat: no shadows.
 */

/** Title row: back link above, status next to the title, one primary action on the right. */
export function PageHeader({
  title,
  description,
  back,
  status,
  actions,
}: {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          aria-label={`Previous page: ${back.label}`}
          title={back.label}
          className="-ml-1 mb-2 inline-flex h-11 items-center gap-1 pr-3 text-fs-14 font-medium text-mute transition hover:text-ink md:h-9"
        >
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
            <path d="M165.66 202.34a8 8 0 0 1-11.32 11.32l-80-80a8 8 0 0 1 0-11.32l80-80a8 8 0 0 1 11.32 11.32L91.31 128Z" />
          </svg>
          Previous page
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="text-fs-32 font-medium leading-tight">{title}</h1>
          {status}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="mt-2 max-w-2xl text-fs-16 text-mute">{description}</p>}
    </header>
  );
}

/** White flat container. `flush` removes padding so tables can reach the edges. */
export function Card({
  title,
  hint,
  actions,
  flush,
  className,
  children,
}: {
  title?: string;
  hint?: ReactNode;
  actions?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-hairline-soft bg-white", className)}>
      {(title || actions) && (
        <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-2", flush ? "p-4 pb-3 lg:p-5 lg:pb-3" : "px-4 pt-4 lg:px-5 lg:pt-5")}>
          <div>
            {title && <h2 className="text-fs-16 font-medium">{title}</h2>}
            {hint && <p className="mt-1 text-fs-14 text-mute">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(!flush && "p-4 lg:p-5", !flush && (title || actions) && "pt-3 lg:pt-3")}>{children}</div>
    </section>
  );
}

/** Pill tabs as links (`?status=`), 40px tall, optional counts. */
export function FilterTabs({ tabs }: { tabs: { label: string; href: string; active: boolean; count?: number }[] }) {
  return (
    <nav aria-label="Filter" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-pill px-4 text-fs-14 font-medium capitalize transition md:h-10",
            t.active ? "bg-ink text-white" : "bg-white text-ink hover:bg-hairline-soft",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className={cn("tabular-nums", t.active ? "text-white/70" : "text-mute")}>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** Search (GET form, keeps other params via hidden inputs) plus a result count. */
export function Toolbar({
  action,
  q,
  placeholder = "Search",
  hidden = {},
  count,
  children,
}: {
  action: string;
  q?: string;
  placeholder?: string;
  hidden?: Record<string, string | undefined>;
  count?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={action} role="search" className="flex min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[240px] items-center gap-2 sm:max-w-sm">
        {Object.entries(hidden).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-pill border border-hairline bg-white px-4 text-fs-14 outline-none focus:border-ink md:h-10"
        />
      </form>
      {children}
      {count && <p className="ml-auto text-fs-14 text-mute">{count}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <p className="text-fs-16 font-medium">{title}</p>
      {body && <p className="max-w-sm text-fs-14 text-mute">{body}</p>}
      {action}
    </div>
  );
}

/** Info / attention box. Never red: red is reserved for prices, failed pills and validation. */
export function Notice({ children, role = "status" }: { children: ReactNode; role?: "status" | "alert" }) {
  return (
    <p role={role} className="mb-6 rounded-xl bg-white p-4 text-fs-14 text-ink ring-1 ring-inset ring-hairline">
      {children}
    </p>
  );
}

/** Table shell: horizontal scroll on small screens, consistent header and cell padding. */
export function DataTable({ head, children, className }: { head: { label: string; node?: ReactNode; align?: "right"; className?: string }[]; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[560px] text-left text-fs-14">
        <thead className="border-b border-hairline-soft text-mute">
          <tr>
            {head.map((h, i) => (
              <th key={`${h.label}-${i}`} scope="col" className={cn("px-4 py-3 font-medium", h.align === "right" && "text-right", h.className)}>
                {h.node ?? h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline-soft">{children}</tbody>
      </table>
    </div>
  );
}

/** Table cell with the standard padding; `href` makes the whole cell content a link. */
export const td = "px-4 py-3 align-middle";

/** Page links for `?page=`. Renders nothing when everything fits on one page. */
export function Pagination({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const link = "inline-flex h-11 items-center md:h-10  rounded-pill border border-hairline bg-white px-4 text-fs-14 font-medium transition hover:border-ink";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-hairline-soft px-4 py-3">
      {page > 1 ? <Link href={href(page - 1)} className={link}>Previous</Link> : <span />}
      <span className="text-fs-14 text-mute">Page {page} of {pages}</span>
      {page < pages ? <Link href={href(page + 1)} className={link}>Next</Link> : <span />}
    </nav>
  );
}

/** Left: title + help; right: the fields. Stacks below md. */
export function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-hairline-soft py-6 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8">
      <div>
        <h2 className="text-fs-16 font-medium">{title}</h2>
        {hint && <p className="mt-1 text-fs-14 text-mute">{hint}</p>}
      </div>
      <div className="min-w-0 rounded-xl border border-hairline-soft bg-white p-4 lg:p-5">{children}</div>
    </section>
  );
}

/** Cards below md, the table from md up. Pass `<ListCard>`s as `cards` and a `<DataTable>` as children. */
export function ResponsiveTable({ cards, children }: { cards: ReactNode; children: ReactNode }) {
  return (
    <>
      <ul className="divide-y divide-hairline-soft md:hidden">{cards}</ul>
      <div className="hidden md:block">{children}</div>
    </>
  );
}

/** One phone row: the whole card is a link to the detail page. Keep it to a title line, a status and 2-3 facts. */
export function ListCard({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex min-h-[72px] items-start gap-3 px-4 py-3 transition active:bg-cloud">
        {children}
      </Link>
    </li>
  );
}
