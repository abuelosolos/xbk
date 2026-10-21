"use server";

import { isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendCustomerEmail } from "@/lib/email";
import { unsubscribeFooter } from "@/lib/newsletter";
import { requireAdmin } from "@/lib/session";
import { fieldErrors } from "@/lib/validation";

export type BroadcastState = { ok?: boolean; sent?: number; failed?: number; errors?: Record<string, string> };

const schema = z.object({
  subject: z.string().trim().min(2, "Enter a subject.").max(200),
  message: z.string().trim().min(2, "Enter a message.").max(5000),
});

/** Sends to every active subscriber, each with their own unsubscribe link. */
export async function sendNewsletter(_prev: BroadcastState, formData: FormData): Promise<BroadcastState> {
  await requireAdmin("/admin/newsletter");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const subs = await getDb().select({ email: newsletterSubscribers.email }).from(newsletterSubscribers).where(isNull(newsletterSubscribers.unsubscribedAt));
  let sent = 0;
  for (let i = 0; i < subs.length; i += 10) {
    const results = await Promise.all(
      subs.slice(i, i + 10).map((s) =>
        sendCustomerEmail({ to: s.email, subject: parsed.data.subject, text: parsed.data.message, footerHtml: unsubscribeFooter(s.email) }),
      ),
    );
    sent += results.filter(Boolean).length;
  }
  return { ok: true, sent, failed: subs.length - sent };
}
