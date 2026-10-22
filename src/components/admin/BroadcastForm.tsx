"use client";

import { useActionState, useRef, useState } from "react";
import { sendNewsletter, type BroadcastState } from "@/app/admin/newsletter/actions";
import { EditPreviewToggle, type EditPreview } from "@/components/admin/ui/EditPreviewToggle";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, fieldCompactClass } from "@/components/ui/Field";

export function BroadcastForm({ recipients }: { recipients: number }) {
  const [state, action, pending] = useActionState<BroadcastState, FormData>(sendNewsletter, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pane, setPane] = useState<EditPreview>("edit");
  const e = state.errors ?? {};
  const who = `${recipients} subscriber${recipients === 1 ? "" : "s"}`;

  return (
    <div>
    <EditPreviewToggle value={pane} onChange={setPane} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <form ref={formRef} action={action} noValidate className={`grid gap-4 ${pane === "preview" ? "hidden lg:grid" : ""}`}>
        <Field compact labelVisible label="Subject" name="subject" value={subject} onChange={(ev) => setSubject(ev.target.value)} error={e.subject} placeholder="This week at XBK" />
        <label className="block">
          <span className="mb-1 block text-fs-14 text-mute">Message</span>
          <textarea name="message" rows={8} value={message} onChange={(ev) => setMessage(ev.target.value)} className={`${fieldCompactClass} h-auto py-3`} />
        </label>
        {e.message && <p role="alert" className="text-fs-14 font-medium text-sale">{e.message}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmDialog
            title={`Send this to ${who}?`}
            body="Emails go out immediately and can't be recalled. Unsubscribed people are skipped."
            confirmLabel="Send"
            onConfirm={() => formRef.current?.requestSubmit()}
            trigger={(open) => (
              <Button type="button" className="w-full sm:w-auto" disabled={pending || recipients === 0} onClick={open}>
                {pending ? "Sending…" : `Send to ${who}`}
              </Button>
            )}
          />
          {recipients === 0 && <p className="text-fs-14 text-mute">No active subscribers yet.</p>}
          {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Sent {state.sent}{state.failed ? `, ${state.failed} failed` : ""}.</p>}
        </div>
      </form>
      <div className={pane === "edit" ? "hidden lg:block" : undefined}>
        <p className="mb-1 text-fs-14 text-mute">Preview</p>
        <div className="rounded-xl bg-cloud p-4">
          <p className="text-fs-14 font-medium">{subject || "Subject"}</p>
          <p className="mt-3 whitespace-pre-line text-fs-14 leading-relaxed">{message || "Your message appears here."}</p>
          <p className="mt-4 text-fs-12 text-mute underline">Unsubscribe</p>
        </div>
      </div>
    </div>
    </div>
  );
}
