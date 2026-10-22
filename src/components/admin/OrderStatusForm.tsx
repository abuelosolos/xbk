"use client";

import { useActionState, useState } from "react";
import { markDelivered, markShipped, type OrderActionState } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/Button";
import { fieldCompactClass } from "@/components/ui/Field";

/** Advances an order one step and (optionally) emails the customer a message the admin can edit first. */
export function OrderStatusForm({
  orderId,
  step,
  defaultSubject,
  defaultMessage,
}: {
  orderId: string;
  step: "shipped" | "delivered";
  defaultSubject: string;
  defaultMessage: string;
}) {
  const action = (step === "shipped" ? markShipped : markDelivered).bind(null, orderId);
  const [state, formAction, pending] = useActionState<OrderActionState, FormData>(action, {});
  const [sendEmail, setSendEmail] = useState(true);
  const label = step === "shipped" ? "Mark shipped" : "Mark delivered";

  return (
    <form action={formAction} className="grid max-w-2xl gap-3">
      <label className="flex items-center gap-2 text-fs-14">
        <input type="checkbox" name="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="size-5 accent-ink" />
        Email the customer
      </label>
      {sendEmail && (
        <>
          <input name="subject" defaultValue={defaultSubject} aria-label="Email subject" className={fieldCompactClass} />
          <textarea name="message" rows={7} defaultValue={defaultMessage} aria-label="Email message" className={`${fieldCompactClass} h-auto py-3`} />
        </>
      )}
      {state.error && <p role="alert" className="text-fs-14 font-medium text-sale">{state.error}</p>}
      {state.ok && (
        <p role="status" className="text-fs-14 font-medium text-success">
          Marked {step}. {state.emailed ? "Customer emailed." : "No email sent."}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>
      </div>
    </form>
  );
}
