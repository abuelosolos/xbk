import { FilterTabs, Notice, PageHeader } from "@/components/admin/ui/layout";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { hasDb } from "@/db";
import { DEFAULT_TEMPLATES, getTemplate, TEMPLATE_KEYS, TEMPLATE_LABELS } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  await requireAdmin("/admin/emails");
  const { t } = await searchParams;
  const key = TEMPLATE_KEYS.find((k) => k === t) ?? TEMPLATE_KEYS[0];
  const template = await getTemplate(key);
  const customised = template.subject !== DEFAULT_TEMPLATES[key].subject || template.body !== DEFAULT_TEMPLATES[key].body;

  return (
    <>
      <PageHeader
        title="Emails"
        description="The default message for each customer email. When you mark an order shipped or delivered you can still edit the text for that one order."
      />
      {!hasDb() && <Notice>Set DATABASE_URL to save templates.</Notice>}
      <div className="mb-6">
        <FilterTabs tabs={TEMPLATE_KEYS.map((k) => ({ label: TEMPLATE_LABELS[k].title, href: `/admin/emails?t=${k}`, active: k === key }))} />
      </div>
      <TemplateForm key={key + template.subject + template.body} templateKey={key} {...TEMPLATE_LABELS[key]} template={template} customised={customised} />
    </>
  );
}
