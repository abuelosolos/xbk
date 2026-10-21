import { eq } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { emailTemplates } from "@/db/schema";

export const TEMPLATE_KEYS = ["order_shipped", "order_delivered", "newsletter_welcome"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];
export type Template = { subject: string; body: string };

export const TEMPLATE_LABELS: Record<TemplateKey, { title: string; hint: string; vars: string[] }> = {
  order_shipped: { title: "Order shipped", hint: "Sent when you mark an order as shipped.", vars: ["name", "reference", "state"] },
  order_delivered: { title: "Package received", hint: "Sent when you mark an order as delivered.", vars: ["name", "reference", "state"] },
  newsletter_welcome: { title: "Newsletter welcome", hint: "Sent to new newsletter subscribers.", vars: [] },
};

// Defaults apply until an admin saves a row (same idea as DEFAULT_RATES in lib/shipping.ts).
export const DEFAULT_TEMPLATES: Record<TemplateKey, Template> = {
  order_shipped: {
    subject: "Your XBK order {{reference}} is on its way",
    body: "Hi {{name}},\n\nGood news: your order {{reference}} has shipped to {{state}}. We'll let you know once it arrives.\n\nThank you for shopping with XBK.",
  },
  order_delivered: {
    subject: "Your XBK order {{reference}} has arrived",
    body: "Hi {{name}},\n\nYour order {{reference}} has been delivered. Thank you for shopping with XBK. We hope you love it!\n\nWearing it? Tag us and tell us what you think.",
  },
  newsletter_welcome: {
    subject: "Welcome to XBK",
    body: "Thanks for joining the XBK list. You'll be the first to hear about new drops and offers.",
  },
};

export async function getTemplate(key: TemplateKey): Promise<Template> {
  if (!hasDb()) return DEFAULT_TEMPLATES[key];
  try {
    const [row] = await getDb().select().from(emailTemplates).where(eq(emailTemplates.key, key)).limit(1);
    return row ? { subject: row.subject, body: row.body } : DEFAULT_TEMPLATES[key];
  } catch (err) {
    console.error("Loading email template failed", err);
    return DEFAULT_TEMPLATES[key];
  }
}

/** Replaces `{{var}}` placeholders; unknown placeholders are left as typed. Values are plain text (escaped when rendered to HTML). */
export const fill = (text: string, vars: Record<string, string>) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);
