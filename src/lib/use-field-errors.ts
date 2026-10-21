"use client";

import { useCallback, useState, type ChangeEvent, type FocusEvent } from "react";
import type { ZodObject, ZodRawShape } from "zod";

/**
 * Per-field validation for forms: shows an error when a filled field loses focus (or on submit),
 * clears it as soon as the value is fixed. Pair with `Field` / `PhoneField`.
 */
export function useFieldErrors(schema: ZodObject<ZodRawShape>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const check = useCallback(
    (name: string, value: unknown) => {
      const rule = schema.shape[name];
      if (!rule) return true;
      const r = rule.safeParse(value);
      setErrors((prev) => {
        const next = { ...prev };
        if (r.success) delete next[name];
        else next[name] = r.error.issues[0]?.message ?? "Check this field.";
        return next;
      });
      return r.success;
    },
    [schema],
  );

  /** Validates the whole form; focuses the first invalid field (schema order matches page order). */
  const checkAll = useCallback(
    (values: Record<string, unknown>) => {
      const r = schema.safeParse(values);
      if (r.success) {
        setErrors({});
        return true;
      }
      const next: Record<string, string> = {};
      for (const issue of r.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      document.querySelector<HTMLElement>(`[data-field="${Object.keys(next)[0]}"]`)?.focus();
      return false;
    },
    [schema],
  );

  /** Spread onto a `Field`. Empty fields are left for submit so tabbing past doesn't nag. */
  const props = (name: string) => ({
    error: errors[name],
    onBlur: (e: FocusEvent<HTMLInputElement>) => {
      if (e.target.value !== "" || errors[name]) check(name, e.target.value);
    },
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      if (errors[name]) check(name, e.target.value);
    },
  });

  return { errors, setErrors, check, checkAll, props };
}
