import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
