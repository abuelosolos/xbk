"use client";

import { useActionState, useRef, useState } from "react";
import { updateShippingRates, type ShippingFormState } from "@/app/admin/shipping/actions";
import { StickyActionBar } from "@/components/admin/ui/StickyActionBar";
import { Button } from "@/components/ui/Button";
import { Field, fieldCompactClass } from "@/components/ui/Field";
import type { ShippingRates } from "@/lib/shipping";

const kobo = (k: number) => String(k / 100);

export function ShippingRatesForm({ rates }: { rates: ShippingRates }) {
  const [state, action, pending] = useActionState<ShippingFormState, FormData>(updateShippingRates, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [search, setSearch] = useState("");
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const key = state.ok ? "saved" : JSON.stringify(e);
  const term = search.trim().toLowerCase();

  /** Writes one fee into every state's fee box (still needs Save). */
  function setAllFees(value: string) {
    for (const box of formRef.current?.querySelectorAll<HTMLInputElement>('input[name^="fee:"]') ?? []) box.value = value;
  }

  return (
    <form key={key} ref={formRef} action={action} noValidate className="max-w-[960px]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          placeholder="Search states"
          aria-label="Search states"
          onKeyDown={(ev) => ev.key === "Enter" && ev.preventDefault()}
          className="h-10 w-full rounded-pill border border-hairline bg-white px-4 text-fs-14 outline-none focus:border-ink sm:max-w-xs"
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <input
            id="all-fee"
            inputMode="decimal"
            placeholder="Fee for all (₦)"
            aria-label="Fee for all states in naira"
            onKeyDown={(ev) => ev.key === "Enter" && ev.preventDefault()}
            className={`${fieldCompactClass} h-10 w-40 rounded-pill`}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setAllFees((document.getElementById("all-fee") as HTMLInputElement).value)}>
            Apply to all
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-hairline-soft bg-white">
        <div className="hidden grid-cols-[1fr_120px_88px_88px_72px] gap-3 border-b border-hairline-soft px-4 py-3 text-fs-14 font-medium text-mute sm:grid">
          <span>State</span><span>Fee (₦)</span><span>Min days</span><span>Max days</span><span>Active</span>
        </div>
        <ul className="divide-y divide-hairline-soft">
          {rates.map((r) => (
            <li
              key={r.state}
              hidden={Boolean(term) && !r.state.toLowerCase().includes(term)}
              className="grid grid-cols-3 items-start gap-3 px-4 py-3 has-[input[type=checkbox]:not(:checked)]:bg-cloud has-[input[type=checkbox]:not(:checked)]:text-mute sm:grid-cols-[1fr_120px_88px_88px_72px]"
            >
              <span className="col-span-3 text-fs-16 font-medium sm:col-span-1 sm:pt-3">{r.state}</span>
              <Field compact labelVisible label="Fee (₦)" wrapperClassName="sm:[&_span.mb-1]:sr-only" name={`fee:${r.state}`} inputMode="decimal" defaultValue={v[`fee:${r.state}`] ?? kobo(r.feeKobo)} error={e[`fee:${r.state}`]} placeholder="Fee (₦)" />
              <Field compact labelVisible label="Min days" wrapperClassName="sm:[&_span.mb-1]:sr-only" name={`min:${r.state}`} inputMode="numeric" defaultValue={v[`min:${r.state}`] ?? String(r.minDays)} error={e[`min:${r.state}`]} placeholder="Min" />
              <Field compact labelVisible label="Max days" wrapperClassName="sm:[&_span.mb-1]:sr-only" name={`max:${r.state}`} inputMode="numeric" defaultValue={v[`max:${r.state}`] ?? String(r.maxDays)} error={e[`max:${r.state}`]} placeholder="Max" />
              <label className="col-span-3 flex items-center gap-2 text-fs-14 sm:col-span-1 sm:h-11">
                <input type="checkbox" name={`active:${r.state}`} defaultChecked={v[`fee:${r.state}`] === undefined ? r.active : `active:${r.state}` in v} className="size-5 accent-ink" />
                <span className="sm:sr-only">Deliver here</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <StickyActionBar>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save rates"}</Button>
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Rates saved.</p>}
        {e.form ? <p role="alert" className="text-fs-14 font-medium text-sale">{e.form}</p> : Object.keys(e).length > 0 && <p role="alert" className="text-fs-14 font-medium text-sale">Fix the highlighted fields.</p>}
      </StickyActionBar>
    </form>
  );
}
