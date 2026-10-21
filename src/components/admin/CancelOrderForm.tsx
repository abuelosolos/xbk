"use client";

import { useActionState, useState } from "react";
import { cancelOrder, type OrderActionState } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/Button";
import { fieldCompactClass } from "@/components/ui/Field";

/** Cancels a paid or shipped order, returns its items to stock and optionally tells the customer. */
export function CancelOrderForm({ orderId, defaultMessage }: { orderId: string; defaultMessage: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<OrderActionState, FormData>(cancelOrder.bind(null, orderId), {});

  if (!open) return <Button type="button" variant="outline" onClick={() => setOpen(true)}>Cancel order</Button>;
  return (
    <form action={formAction} className="grid max-w-2xl gap-3">
      <p className="text-fs-14 text-mute">
        The items go back into stock. Issue the refund in the Paystack dashboard and note its reference below.
      </p>
      <input name="note" maxLength={200} aria-label="Refund reference or note" placeholder="Refund reference or note (optional)" className={fieldCompactClass} />
      <label className="flex items-center gap-2 text-fs-14">
        <input type="checkbox" name="sendEmail" defaultChecked className="size-4 accent-ink" />
        Email the customer
      </label>
      <textarea name="message" rows={5} defaultValue={defaultMessage} aria-label="Email message" className={`${fieldCompactClass} h-auto py-3`} />
      {state.error && <p role="alert" className="text-fs-14 font-medium text-sale">{state.error}</p>}
      {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Order cancelled and restocked. {state.emailed ? "Customer emailed." : "No email sent."}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Cancelling…" : "Confirm cancellation"}</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Keep order</Button>
      </div>
    </form>
  );
}
