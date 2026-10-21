"use client";

import { useActionState } from "react";
import { updateShippingRates, type ShippingFormState } from "@/app/admin/shipping/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { ShippingRates } from "@/lib/shipping";

const kobo = (k: number) => String(k / 100);

export function ShippingRatesForm({ rates }: { rates: ShippingRates }) {
  const [state, action, pending] = useActionState<ShippingFormState, FormData>(updateShippingRates, {});
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const key = state.ok ? "saved" : JSON.stringify(e);

  return (
    <form key={key} action={action} noValidate className="max-w-3xl">
      <div className="hidden grid-cols-[1fr_120px_72px_72px_64px] gap-3 border-b border-hairline pb-2 text-fs-14 text-mute sm:grid">
        <span>State</span><span>Fee (₦)</span><span>Min days</span><span>Max days</span><span>Active</span>
      </div>
      <ul className="divide-y divide-hairline-soft">
        {rates.map((r) => (
          <li key={r.state} className="grid grid-cols-3 items-start gap-3 py-3 sm:grid-cols-[1fr_120px_72px_72px_64px]">
            <span className="col-span-3 text-fs-16 font-medium sm:col-span-1 sm:pt-3">{r.state}</span>
            <Field compact label={`${r.state} fee in naira`} name={`fee:${r.state}`} inputMode="decimal" defaultValue={v[`fee:${r.state}`] ?? kobo(r.feeKobo)} error={e[`fee:${r.state}`]} placeholder="Fee (₦)" />
            <Field compact label={`${r.state} minimum days`} name={`min:${r.state}`} inputMode="numeric" defaultValue={v[`min:${r.state}`] ?? String(r.minDays)} error={e[`min:${r.state}`]} placeholder="Min" />
            <Field compact label={`${r.state} maximum days`} name={`max:${r.state}`} inputMode="numeric" defaultValue={v[`max:${r.state}`] ?? String(r.maxDays)} error={e[`max:${r.state}`]} placeholder="Max" />
            <label className="col-span-3 flex items-center gap-2 text-fs-14 sm:col-span-1 sm:h-11">
              <input type="checkbox" name={`active:${r.state}`} defaultChecked={v[`fee:${r.state}`] === undefined ? r.active : `active:${r.state}` in v} className="size-4 accent-ink" />
              <span className="sm:sr-only">Deliver here</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save rates"}</Button>
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Rates saved.</p>}
        {e.form ? <p role="alert" className="text-fs-14 font-medium text-sale">{e.form}</p> : Object.keys(e).length > 0 && <p role="alert" className="text-fs-14 font-medium text-sale">Fix the highlighted fields.</p>}
      </div>
    </form>
  );
}
