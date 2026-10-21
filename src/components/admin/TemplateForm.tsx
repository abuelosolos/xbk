"use client";

import { useActionState } from "react";
import { resetTemplate, saveTemplate, type TemplateFormState } from "@/app/admin/emails/actions";
import { Button } from "@/components/ui/Button";
import { Field, fieldCompactClass } from "@/components/ui/Field";
import type { Template, TemplateKey } from "@/lib/email-templates";

export function TemplateForm({ templateKey, title, hint, vars, template }: { templateKey: TemplateKey; title: string; hint: string; vars: string[]; template: Template }) {
  const [state, action, pending] = useActionState<TemplateFormState, FormData>(saveTemplate, {});
  const e = state.errors ?? {};
  return (
    <section className="max-w-2xl">
      <h2 className="text-fs-20 font-medium">{title}</h2>
      <p className="mb-3 text-fs-14 text-mute">
        {hint}
        {vars.length > 0 && <> Placeholders: {vars.map((v) => `{{${v}}}`).join(", ")}.</>}
      </p>
      <form action={action} noValidate className="grid gap-3">
        <input type="hidden" name="key" value={templateKey} />
        <Field compact label="Subject" name="subject" defaultValue={template.subject} error={e.subject} placeholder="Subject" />
        <textarea name="body" rows={7} defaultValue={template.body} aria-label={`${title} message`} className={`${fieldCompactClass} h-auto py-3`} />
        {e.body && <p role="alert" className="text-fs-14 font-medium text-sale">{e.body}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          <Button type="submit" variant="secondary" formAction={resetTemplate} formNoValidate>Reset to default</Button>
          {state.ok && <p role="status" className="text-fs-14 font-medium text-success">Saved.</p>}
        </div>
      </form>
    </section>
  );
}
