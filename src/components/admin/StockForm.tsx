"use client";

import { useActionState } from "react";
import { adjustStock, type StockState } from "@/app/admin/inventory/actions";
import { Button } from "@/components/ui/Button";
import { ADMIN_REASONS, REASON_LABEL } from "@/lib/stock";

const input = "h-9 rounded-pill border border-hairline bg-white px-3 text-fs-14 outline-none focus:border-ink";

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
      className="flex flex-wrap items-center gap-2"
    >
      <input name="amount" defaultValue="1" inputMode="numeric" aria-label="Amount to add or remove" className={`${input} w-16`} />
      <select name="reason" defaultValue="restock" aria-label="Reason" className={input}>
        {ADMIN_REASONS.map((r) => (
          <option key={r} value={r}>{REASON_LABEL[r]}</option>
        ))}
      </select>
      <input name="note" maxLength={200} placeholder="Note (optional)" aria-label="Note" className={`${input} w-40`} />
      <Button type="submit" name="sign" value="-" size="sm" variant="secondary" disabled={pending} aria-label="Remove from stock">−</Button>
      <Button type="submit" name="sign" value="+" size="sm" variant="secondary" disabled={pending} aria-label="Add to stock">+</Button>
      {state.error && <span role="alert" className="basis-full text-fs-12 font-medium text-sale">{state.error}</span>}
      {state.ok && <span role="status" className="basis-full text-fs-12 text-mute">Stock is now {state.stock}.</span>}
    </form>
  );
}
