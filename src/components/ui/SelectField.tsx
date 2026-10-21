"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useId, type ComponentProps } from "react";
import { FieldWrap, fieldClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type SelectFieldProps = Omit<ComponentProps<"select">, "children"> & {
  label: string;
  error?: string;
  placeholder: string;
  options: { value: string; label: string }[];
};

/** Native select (best mobile picker) with the same chrome and error bubble as `Field`. */
export function SelectField({ label, error, placeholder, options, name, className, value, ...props }: SelectFieldProps) {
  const errorId = useId();
  return (
    <FieldWrap error={error} id={errorId}>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <select
          name={name}
          data-field={name}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(fieldClass, "appearance-none pr-10", value === "" && "text-mute", className)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <CaretDown size={16} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
      </label>
    </FieldWrap>
  );
}
