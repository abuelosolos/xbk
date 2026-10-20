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

export const formatNaira = (kobo: number) => naira.format(kobo / 100);

export const safeNext = (next: string | null | undefined, fallback = "/") =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
