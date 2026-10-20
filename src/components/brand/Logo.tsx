import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * XBK mark: a rounded triangle. The top 30% fades in from 20% opacity to full,
 * then stays solid to the base. Colour comes from `currentColor`.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = `xbk-fade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox="0 0 100 64"
      className={cn("h-auto", className)}
      role="img"
      aria-label="XBK"
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="64">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 5,59 95,59"
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="9"
        strokeLinejoin="round"
      />
    </svg>
  );
}
