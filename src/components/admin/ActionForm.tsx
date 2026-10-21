"use client";

import { useActionState, type ReactNode } from "react";
import type { CategoryState } from "@/app/admin/categories/actions";
import { Button } from "@/components/ui/Button";

/** A small inline form around a server action that returns `{ ok?, error? }`. */
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
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault();
      }}
      className={className ?? "flex flex-wrap items-center gap-2"}
    >
      {children}
      <Button type="submit" size="sm" variant={variant} disabled={pending}>{pending ? "…" : submit}</Button>
      {state.error && <span role="alert" className="text-fs-12 font-medium text-sale">{state.error}</span>}
    </form>
  );
}
