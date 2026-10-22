"use client";

import { cn } from "@/lib/utils";

export type EditPreview = "edit" | "preview";

/** Segmented Edit | Preview control, shown below lg where the two panes stack. */
export function EditPreviewToggle({ value, onChange }: { value: EditPreview; onChange: (v: EditPreview) => void }) {
  return (
    <div role="tablist" aria-label="Edit or preview" className="mb-4 flex rounded-pill bg-white p-1 lg:hidden">
      {(["edit", "preview"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cn("h-11 flex-1 rounded-pill text-fs-14 font-medium capitalize transition", value === v ? "bg-ink text-white" : "text-mute")}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
