"use server";

import { sql } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendCustomerEmail } from "@/lib/email";
import { fill, getTemplate } from "@/lib/email-templates";
import { unsubscribeFooter } from "@/lib/newsletter";
import { email as emailRule } from "@/lib/validation";

/** Public (footer form): validates with Zod and only ever touches newsletter_subscribers. */
export async function subscribeNewsletter(raw: string): Promise<{ ok: boolean; error?: string }> {
  const parsed = emailRule.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  if (!hasDb()) return { ok: true }; // demo mode: nothing to store
  const email = parsed.data.toLowerCase();

  try {
    // Re-subscribing clears unsubscribed_at; only a genuinely new/returning address gets the welcome mail.
    const rows = await getDb()
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { unsubscribedAt: null },
        setWhere: sql`${newsletterSubscribers.unsubscribedAt} is not null`,
      })
      .returning({ id: newsletterSubscribers.id });
    if (rows.length) {
      const tpl = await getTemplate("newsletter_welcome");
      await sendCustomerEmail({ to: email, subject: tpl.subject, text: fill(tpl.body, {}), footerHtml: unsubscribeFooter(email) });
    }
    return { ok: true };
  } catch (err) {
    console.error("Newsletter signup failed", err);
    return { ok: false, error: "Couldn't subscribe right now. Please try again." };
  }
}
