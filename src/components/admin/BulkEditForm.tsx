"use client";

import { useActionState, useEffect, useState } from "react";
import { bulkEditProducts, type BulkState } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/Button";
import { fieldCompactClass } from "@/components/ui/Field";

/** Appears when products are ticked in the table (their checkboxes point at this form by id). */
export function BulkEditForm() {
  const [state, action, pending] = useActionState<BulkState, FormData>(bulkEditProducts, {});
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const count = () => setSelected(document.querySelectorAll('input[name="ids"]:checked').length);
    document.addEventListener("change", count);
    document.addEventListener("bulk-select", count);
    return () => {
      document.removeEventListener("change", count);
      document.removeEventListener("bulk-select", count);
    };
  }, []);

  if (selected === 0 && !state.message && !state.error) return <form id="bulk-edit" action={action} />;
  return (
    <form id="bulk-edit" action={action} className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 grid grid-cols-2 items-center gap-2 border-t border-hairline bg-white p-3 md:static md:mb-4 md:flex md:flex-wrap md:gap-3 md:rounded-xl md:border md:p-3 lg:p-4">
      <span className="col-span-2 text-fs-14 font-medium">{selected} selected</span>
      <input name="percent" inputMode="decimal" aria-label="Price change in percent" placeholder="Price % (e.g. -10)" className={`${fieldCompactClass} w-full md:w-56`} />
      <input name="addStock" inputMode="numeric" aria-label="Stock to add" placeholder="Add stock (e.g. 20)" className={`${fieldCompactClass} w-full md:w-44`} />
      <Button type="submit" size="sm" className="col-span-2 w-full md:w-auto" disabled={pending || selected === 0}>{pending ? "Applying…" : "Apply"}</Button>
      {state.error && <p role="alert" className="col-span-2 w-full text-fs-14 font-medium text-sale">{state.error}</p>}
      {state.ok && <p role="status" className="col-span-2 w-full text-fs-14 font-medium text-success">{state.message}</p>}
    </form>
  );
}
