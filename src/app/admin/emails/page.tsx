import { hasDb } from "@/db";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { getTemplate, TEMPLATE_KEYS, TEMPLATE_LABELS } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  await requireAdmin("/admin/emails");
  const templates = await Promise.all(TEMPLATE_KEYS.map(async (k) => [k, await getTemplate(k)] as const));
  return (
    <>
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Emails</h1>
      <p className="mb-8 max-w-xl text-fs-16 text-mute">
        The default message for each customer email. When you mark an order shipped or delivered you can still edit the text for that one order.
      </p>
      {!hasDb() && <p className="mb-6 bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to save templates.</p>}
      <div className="space-y-12">
        {templates.map(([k, t]) => (
          <TemplateForm key={k + t.subject + t.body} templateKey={k} {...TEMPLATE_LABELS[k]} template={t} />
        ))}
      </div>
    </>
  );
}
