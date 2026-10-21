"use client";

import { useId } from "react";
import { FieldWrap } from "@/components/ui/Field";
import { NigeriaFlag } from "@/components/ui/NigeriaFlag";
import { nationalDigits, PHONE_PREFIX, toFullPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Nigerian phone input: fixed flag + "+234" cell, then 10 editable digits. `value` is the full
 * "+234…" number (or ""); a hidden input named `phone` carries it with the form.
 */
export function PhoneField({
  value,
  onValueChange,
  error,
  onBlur,
  name = "phone",
  labelVisible,
}: {
  value: string;
  onValueChange: (full: string) => void;
  error?: string;
  onBlur?: () => void;
  name?: string;
  labelVisible?: boolean;
}) {
  const errorId = useId();
  const digits = value.replace(PHONE_PREFIX, "");

  return (
    <FieldWrap error={error} id={errorId}>
      <label className="block">
        <span className={labelVisible ? "mb-1 block text-fs-14 text-mute" : "sr-only"}>Phone number</span>
        <div
          className={cn(
            "flex h-12 w-full overflow-hidden rounded-field border border-hairline bg-white transition focus-within:border-ink focus-within:ring-2 focus-within:ring-ink",
            error && "border-sale",
          )}
        >
          <span className="flex shrink-0 items-center gap-2 border-r border-hairline bg-cloud pl-4 pr-3 text-fs-16 text-ink">
            <NigeriaFlag />
            {PHONE_PREFIX}
          </span>
          <input
            data-field={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="803 123 4567"
            value={digits.replace(/(\d{3})(?=\d)/g, "$1 ").trimEnd()}
            onChange={(e) => onValueChange(toFullPhone(nationalDigits(e.target.value)))}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="min-w-0 flex-1 bg-transparent px-4 text-fs-16 outline-none placeholder:text-mute"
          />
        </div>
      </label>
      <input type="hidden" name={name} value={value} />
    </FieldWrap>
  );
}
