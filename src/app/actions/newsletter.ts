"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendCustomerEmail } from "@/lib/email";
import { fill, getTemplate } from "@/lib/email-templates";
import { NEWSLETTER_COOKIE, unsubscribeFooter } from "@/lib/newsletter";
import { getSession } from "@/lib/session";
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
    (await cookies()).set(NEWSLETTER_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return { ok: true };
  } catch (err) {
    console.error("Newsletter signup failed", err);
    return { ok: false, error: "Couldn't subscribe right now. Please try again." };
  }
}

/**
 * Whether the footer should hide the signup form: this browser already subscribed, or the signed-in
 * account's email is an active subscriber. Called from the client so the layout stays static.
 */
export async function getNewsletterStatus(): Promise<{ subscribed: boolean }> {
  try {
    if ((await cookies()).has(NEWSLETTER_COOKIE)) return { subscribed: true };
    if (!hasDb()) return { subscribed: false };
    const session = await getSession();
    if (!session) return { subscribed: false };
    const [row] = await getDb()
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(and(eq(newsletterSubscribers.email, session.user.email.toLowerCase()), isNull(newsletterSubscribers.unsubscribedAt)))
      .limit(1);
    return { subscribed: Boolean(row) };
  } catch (err) {
    console.error("Newsletter status check failed", err);
    return { subscribed: false };
  }
}
