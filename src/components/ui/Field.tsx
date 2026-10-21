"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
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
  /** Small grey icon inside the left edge (auth forms). */
  icon?: ReactNode;
  /** Light grey fill, no border (auth forms). */
  filled?: boolean;
};

/** Eye button for password inputs: click to reveal, hides again on blur and on form submit. */
function PasswordInput({ className, onBlur, leading, ...props }: ComponentProps<"input"> & { leading?: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const hide = () => setVisible(false);
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  return (
    <span className="relative block">
      {leading}
      <input
        {...props}
        id={id}
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-12 [&::-ms-reveal]:hidden")}
        onBlur={(e) => {
          // focus moving to the eye button must not hide the text it is about to toggle
          if (!(e.relatedTarget as HTMLElement | null)?.dataset.passwordToggle) setVisible(false);
          onBlur?.(e);
        }}
      />
      <button
        type="button"
        data-password-toggle
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        onMouseDown={(e) => e.preventDefault()} // keep the caret in the field
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
      >
        {visible ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
      </button>
    </span>
  );
}

export function Field({ label, error, compact, labelVisible, wrapperClassName, className, name, icon, filled, ...props }: FieldProps) {
  const errorId = useId();
  const controlProps = {
    name,
    "data-field": name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(compact ? fieldCompactClass : fieldClass, filled && "border-transparent bg-cloud", icon && "pl-11", className),
    ...props,
  };
  const leading = icon ? (
    <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute">{icon}</span>
  ) : null;
  return (
    <FieldWrap error={error} id={errorId} className={wrapperClassName}>
      <label className="block">
        <span className={labelVisible ? "mb-1 block text-fs-14 text-mute" : "sr-only"}>{label}</span>
        {props.type === "password" ? (
          <PasswordInput {...controlProps} leading={leading} />
        ) : leading ? (
          <span className="relative block">{leading}<input {...controlProps} /></span>
        ) : (
          <input {...controlProps} />
        )}
      </label>
    </FieldWrap>
  );
}
