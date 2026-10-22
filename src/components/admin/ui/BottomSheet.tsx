"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Native <dialog>: a bottom sheet on phones, a centred dialog from md up. Controlled by `open`;
 * closes on Escape, backdrop tap or the Close button, always reporting through `onClose`.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="sheet m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border-0 bg-white p-0 text-ink backdrop:bg-ink/40 md:m-auto md:w-[min(92vw,420px)] md:rounded-xl"
    >
      <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-fs-16 font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex size-11 items-center justify-center rounded-full text-fs-16 transition hover:bg-cloud md:size-9"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
