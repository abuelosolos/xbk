"use client";

import { useActionState } from "react";
import { sendNewsletter, type BroadcastState } from "@/app/admin/newsletter/actions";
import { Button } from "@/components/ui/Button";
import { Field, fieldCompactClass } from "@/components/ui/Field";

export function BroadcastForm({ recipients }: { recipients: number }) {
  const [state, action, pending] = useActionState<BroadcastState, FormData>(sendNewsletter, {});
  const e = state.errors ?? {};
  return (
    <form
      action={action}
      noValidate
      onSubmit={(ev) => {
        if (!confirm(`Send this to ${recipients} subscriber${recipients === 1 ? "" : "s"}?`)) ev.preventDefault();
      }}
      className="grid max-w-2xl gap-3"
    >
      <Field compact label="Subject" name="subject" error={e.subject} placeholder="Subject" />
      <textarea name="message" rows={8} aria-label="Message" placeholder="Message" className={`${fieldCompactClass} h-auto py-3`} />
      {e.message && <p role="alert" className="text-fs-14 font-medium text-sale">{e.message}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending || recipients === 0}>{pending ? "Sending…" : "Send to all subscribers"}</Button>
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Sent {state.sent}{state.failed ? `, ${state.failed} failed` : ""}.</p>}
      </div>
    </form>
  );
}
