"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pinned to the bottom while a long form is edited; on phones it rides above the admin tab bar and the iPhone safe area. */
export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline-soft bg-white px-4 py-3 md:bottom-0 md:-mx-0 md:rounded-xl md:border",
        "[&>button:first-child]:w-full md:[&>button:first-child]:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
