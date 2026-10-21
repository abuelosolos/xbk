import { createHmac, timingSafeEqual } from "node:crypto";

/** Remembers on this browser that someone subscribed. A flag only, never the address. */
export const NEWSLETTER_COOKIE = "xbk_nl";

const secret = () => process.env.BETTER_AUTH_SECRET ?? "dev-only-secret";

export const unsubscribeToken = (email: string) => createHmac("sha256", secret()).update(email.toLowerCase()).digest("hex");

export function validUnsubscribeToken(email: string, token: string) {
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(email: string) {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return `${base}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

export const unsubscribeFooter = (email: string) =>
  `<p style="color:#707072;font-size:12px"><a href="${unsubscribeUrl(email)}" style="color:#707072">Unsubscribe</a></p>`;
