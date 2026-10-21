import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// text-fs-* are the responsive font sizes from globals.css; without this twMerge reads them as colors
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["fs-32", "fs-24", "fs-16", "fs-14", "fs-13", "fs-12"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** "19.99" -> 1999 kobo, parsed from the typed string so float rounding can never move a kobo. */
export function nairaToKobo(naira: string): number {
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(naira.trim());
  if (!m) throw new Error(`Invalid naira amount: "${naira}"`);
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
}

export const formatNaira = (kobo: number) => naira.format(kobo / 100);

export const safeNext = (next: string | null | undefined, fallback = "/") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
