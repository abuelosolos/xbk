"use client";

import { useActionState, useRef, useState } from "react";
import { resetTemplate, saveTemplate, sendTestEmail, type TemplateFormState, type TestEmailState } from "@/app/admin/emails/actions";
import { Pill } from "@/components/account/StatusPill";
import { Card } from "@/components/admin/ui/layout";
import { EditPreviewToggle, type EditPreview } from "@/components/admin/ui/EditPreviewToggle";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, fieldCompactClass } from "@/components/ui/Field";
import { fill, SAMPLE_VARS } from "@/lib/email-fill";
import type { Template, TemplateKey } from "@/lib/email-templates";

export function TemplateForm({
  templateKey,
  title,
  hint,
  vars,
  template,
  customised,
}: {
  templateKey: TemplateKey;
  title: string;
  hint: string;
  vars: string[];
  template: Template;
  customised: boolean;
}) {
  const [state, action, pending] = useActionState<TemplateFormState, FormData>(saveTemplate, {});
  const [test, testAction, testing] = useActionState<TestEmailState, FormData>(sendTestEmail, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [pane, setPane] = useState<EditPreview>("edit");
  const e = state.errors ?? {};

  return (
    <div>
    <EditPreviewToggle value={pane} onChange={setPane} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Card
        className={pane === "preview" ? "hidden lg:block" : undefined}
        title={title}
        hint={
          <>
            {hint}
            {vars.length > 0 && <> Placeholders: {vars.map((v) => `{{${v}}}`).join(", ")}.</>}
          </>
        }
        actions={<Pill tone={customised ? "dark" : "neutral"}>{customised ? "Customised" : "Default"}</Pill>}
      >
        <form ref={formRef} action={action} noValidate className="grid gap-4">
          <input type="hidden" name="key" value={templateKey} />
          <Field compact labelVisible label="Subject" name="subject" value={subject} onChange={(ev) => setSubject(ev.target.value)} error={e.subject} placeholder="Subject" />
          <label className="block">
            <span className="mb-1 block text-fs-14 text-mute">Message</span>
            <textarea name="body" rows={9} value={body} onChange={(ev) => setBody(ev.target.value)} className={`${fieldCompactClass} h-auto py-3`} />
          </label>
          {e.body && <p role="alert" className="text-fs-14 font-medium text-sale">{e.body}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="w-full sm:w-auto" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
            <Button type="submit" variant="outline" className="w-full sm:w-auto" formAction={testAction} disabled={testing}>{testing ? "Sending…" : "Send test to me"}</Button>
            {customised && (
              <ConfirmDialog
                title="Reset to the default message?"
                body="Your customised subject and message will be replaced."
                confirmLabel="Reset"
                onConfirm={() => {
                  const f = new FormData();
                  f.set("key", templateKey);
                  void resetTemplate(f);
                }}
                trigger={(open) => <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={open}>Reset to default</Button>}
              />
            )}
          </div>
          {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Saved.</p>}
          {test.ok && <p role="status" className="text-fs-14 text-mute">Test email sent to your address.</p>}
          {test.error && <p role="alert" className="text-fs-14 font-medium text-sale">{test.error}</p>}
        </form>
      </Card>

      <Card className={pane === "edit" ? "hidden lg:block" : undefined} title="Preview" hint="Shown with example values (Ada, A1B2C3D4, Lagos).">
        <p className="text-fs-14 font-medium">{fill(subject, SAMPLE_VARS)}</p>
        <div className="mt-3 space-y-3 whitespace-pre-line rounded-xl bg-cloud p-4 text-fs-14 leading-relaxed">{fill(body, SAMPLE_VARS)}</div>
      </Card>
    </div>
    </div>
  );
}
