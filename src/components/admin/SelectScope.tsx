"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Phones only: checkboxes on product cards stay hidden until "Select" is tapped. Wrap the cards;
 * descendants with `group-data-[selecting=true]:flex` (or block) appear while selecting.
 */
export function SelectScope({ children }: { children: ReactNode }) {
  const [selecting, setSelecting] = useState(false);
  return (
    <div className="group md:hidden" data-selecting={selecting}>
      <div className="flex justify-end border-b border-hairline-soft px-4 py-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            if (selecting) {
              for (const box of document.querySelectorAll<HTMLInputElement>('input[name="ids"]')) box.checked = false;
              document.dispatchEvent(new Event("bulk-select"));
            }
            setSelecting((s) => !s);
          }}
        >
          {selecting ? "Done" : "Select"}
        </Button>
      </div>
      {children}
    </div>
  );
}
