import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * XBK mark: a rounded, near-equilateral triangle (100×84). The top 30% fades in from 20% opacity to full,
 * then stays solid to the base. Colour comes from `currentColor`.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = `xbk-fade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox="0 0 100 84"
      className={cn("h-auto", className)}
      role="img"
      aria-label="XBK"
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="84">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* single filled outline (no stroke) so the faded tip doesn't show a doubled edge */}
      <path d="M54.27 2.40 L99.27 76.40 A5 5 0 0 1 95 84 L5 84 A5 5 0 0 1 0.73 76.40 L45.73 2.40 A5 5 0 0 1 54.27 2.40 Z" fill={`url(#${gradientId})`} />
    </svg>
  );
}
