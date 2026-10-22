"use client";

import { useActionState } from "react";
import { adjustStock, type StockState } from "@/app/admin/inventory/actions";
import { Button } from "@/components/ui/Button";
import { ADMIN_REASONS, REASON_LABEL } from "@/lib/stock";

const input = "h-11 rounded-pill md:h-10 border border-hairline bg-white px-3 text-fs-14 outline-none focus:border-ink";

/**
 * Remove / add stock with a reason. Changes are deltas, so they never overwrite a sale made meanwhile.
 * Only the − and + buttons submit (Enter is blocked) so the direction is always explicit.
 */
export function StockForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<StockState, FormData>(adjustStock.bind(null, id), {});
  return (
    <form
      action={action}
      key={state.ok ? "done" : "idle"}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
      }}
      className="grid grid-cols-[5rem_1fr] gap-2 md:flex md:flex-wrap md:items-center"
    >
      <input name="amount" defaultValue="1" inputMode="numeric" aria-label="Amount to add or remove" className={`${input} w-full md:w-16`} />
      <select name="reason" defaultValue="restock" aria-label="Reason" className={`${input} w-full md:w-auto`}>
        {ADMIN_REASONS.map((r) => (
          <option key={r} value={r}>{REASON_LABEL[r]}</option>
        ))}
      </select>
      <input name="note" maxLength={200} placeholder="Note (optional)" aria-label="Note" className={`${input} col-span-2 w-full md:col-span-1 md:w-40`} />
      <Button type="submit" name="sign" value="-" size="sm" className="w-full md:w-auto" variant="secondary" disabled={pending} aria-label="Remove from stock">− Remove</Button>
      <Button type="submit" name="sign" value="+" size="sm" className="w-full md:w-auto" variant="outline" disabled={pending} aria-label="Add to stock">+ Add</Button>
      {state.error && <span role="alert" className="basis-full text-fs-12 font-medium text-sale">{state.error}</span>}
      {state.ok && <span role="status" className="col-span-2 basis-full text-fs-14 text-mute">Stock is now {state.stock}.</span>}
    </form>
  );
}
