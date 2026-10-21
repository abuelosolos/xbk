"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const fieldClass =
  "h-12 w-full rounded-field border border-hairline bg-white px-4 text-fs-16 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink disabled:bg-cloud disabled:text-mute aria-[invalid=true]:border-sale";
export const fieldCompactClass = fieldClass.replace("h-12", "h-11").replace("text-fs-16", "text-fs-14");

/** Small white bubble under a field, with the validation message in red. */
export function ErrorBubble({ id, message }: { id?: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="pointer-events-none absolute left-3 top-full z-10 mt-2 max-w-[calc(100%-1.5rem)] rounded-[8px] border border-hairline bg-white px-3 py-2 text-fs-14 font-medium leading-snug text-sale"
        >
          <span aria-hidden className="absolute -top-[5px] left-4 size-2 rotate-45 border-l border-t border-hairline bg-white" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** Positioning context for a control plus its error bubble (use directly for selects, files, textareas). */
export function FieldWrap({ error, id, children, className }: { error?: string; id?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <ErrorBubble id={id} message={error} />
    </div>
  );
}

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  compact?: boolean;
  /** Show the label above the field; otherwise it is screen-reader only and the placeholder leads. */
  labelVisible?: boolean;
  wrapperClassName?: string;
};

export function Field({ label, error, compact, labelVisible, wrapperClassName, className, name, ...props }: FieldProps) {
  const errorId = useId();
  return (
    <FieldWrap error={error} id={errorId} className={wrapperClassName}>
      <label className="block">
        <span className={labelVisible ? "mb-1 block text-fs-14 text-mute" : "sr-only"}>{label}</span>
        <input
          name={name}
          data-field={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(compact ? fieldCompactClass : fieldClass, className)}
          {...props}
        />
      </label>
    </FieldWrap>
  );
}
