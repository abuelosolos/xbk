"use client";

import { useActionState } from "react";
import { bulkEditProducts, type BulkState } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/Button";
import { fieldCompactClass } from "@/components/ui/Field";

/** Applies to the products ticked in the table below (their checkboxes point at this form by id). */
export function BulkEditForm() {
  const [state, action, pending] = useActionState<BulkState, FormData>(bulkEditProducts, {});
  return (
    <form id="bulk-edit" action={action} className="mb-6 flex flex-wrap items-center gap-3 bg-cloud p-4">
      <span className="text-fs-14 font-medium">Selected products:</span>
      <input name="percent" inputMode="decimal" aria-label="Price change in percent" placeholder="Price change % (e.g. -10)" className={`${fieldCompactClass} w-56`} />
      <input name="addStock" inputMode="numeric" aria-label="Stock to add" placeholder="Add stock (e.g. 20)" className={`${fieldCompactClass} w-44`} />
      <Button type="submit" size="sm" disabled={pending}>{pending ? "Applying…" : "Apply"}</Button>
      {state.error && <p role="alert" className="w-full text-fs-14 font-medium text-sale">{state.error}</p>}
      {state.ok && <p role="status" className="w-full text-fs-14 font-medium text-success">{state.message}</p>}
    </form>
  );
}
