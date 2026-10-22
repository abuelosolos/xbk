"use client";

import { useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/admin/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

/**
 * In-app replacement for window.confirm(), a bottom sheet on phones. Wrap the trigger; `onConfirm` runs when
 * the person agrees. The confirm button uses the filled style (destructive actions are never red buttons here).
 */
export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  trigger: (open: () => void) => ReactNode;
  title: string;
  body?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger(() => setOpen(true))}
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        {body && <p className="text-fs-14 text-mute">{body}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button type="button" variant="secondary" size="sm" className="w-full md:w-auto" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="button"
            size="sm"
            className="w-full md:w-auto"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
