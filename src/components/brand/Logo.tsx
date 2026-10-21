import { cn } from "@/lib/utils";

/**
 * XBK mark: a solid, rounded triangle (96×84 in a 100×84 box). Colour comes from `currentColor`.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 84" className={cn("h-auto", className)} role="img" aria-label="XBK" fill="none">
      <path d="M57.75 4.42 L96.75 70.42 A9 9 0 0 1 89.00 84.00 L11.00 84.00 A9 9 0 0 1 3.25 70.42 L42.25 4.42 A9 9 0 0 1 57.75 4.42 Z" fill="currentColor" />
    </svg>
  );
}
