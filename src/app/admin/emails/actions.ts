"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { emailTemplates } from "@/db/schema";
import { TEMPLATE_KEYS } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/session";
import { fieldErrors } from "@/lib/validation";

export type TemplateFormState = { ok?: boolean; errors?: Record<string, string> };

const schema = z.object({
  key: z.enum(TEMPLATE_KEYS),
  subject: z.string().trim().min(2, "Enter a subject.").max(200),
  body: z.string().trim().min(2, "Enter a message.").max(5000),
});

export async function saveTemplate(_prev: TemplateFormState, formData: FormData): Promise<TemplateFormState> {
  await requireAdmin("/admin/emails");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await getDb()
    .insert(emailTemplates)
    .values(parsed.data)
    .onConflictDoUpdate({ target: emailTemplates.key, set: { subject: parsed.data.subject, body: parsed.data.body, updatedAt: new Date() } });
  revalidatePath("/admin/emails");
  return { ok: true };
}

export async function resetTemplate(formData: FormData) {
  await requireAdmin("/admin/emails");
  const key = z.enum(TEMPLATE_KEYS).safeParse(formData.get("key"));
  if (!key.success) return;
  await getDb().delete(emailTemplates).where(eq(emailTemplates.key, key.data));
  revalidatePath("/admin/emails");
}
