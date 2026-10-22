"use client";

import { useActionState, useRef, type ReactNode } from "react";
import type { CategoryState } from "@/app/admin/categories/actions";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

/** A small inline form around a server action that returns `{ ok?, error? }`. `confirmText` opens an in-app dialog first. */
export function ActionForm({
  action,
  submit,
  variant = "secondary",
  confirmText,
  className,
  children,
}: {
  action: (prev: CategoryState, formData: FormData) => Promise<CategoryState>;
  submit: string;
  variant?: "primary" | "secondary";
  confirmText?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={formAction} className={className ?? "flex flex-wrap items-center gap-2"}>
      {children}
      {confirmText ? (
        <ConfirmDialog
          title={confirmText}
          confirmLabel={submit}
          onConfirm={() => formRef.current?.requestSubmit()}
          trigger={(open) => (
            <Button type="button" size="sm" variant={variant} disabled={pending} onClick={open}>{pending ? "…" : submit}</Button>
          )}
        />
      ) : (
        <Button type="submit" size="sm" variant={variant} disabled={pending}>{pending ? "…" : submit}</Button>
      )}
      {state.error && <span role="alert" className="text-fs-12 font-medium text-sale">{state.error}</span>}
    </form>
  );
}
