import { Resend } from "resend";
import { formatNaira } from "./utils";

export interface OrderEmail {
  reference: string;
  email: string;
  totalKobo: number;
  shippingFeeKobo: number;
  shipping: { fullName: string; phone: string; address: string; city: string; state: string };
  items: { name: string; size: string; color: string; qty: number; unitPriceKobo: number }[];
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function body(o: OrderEmail) {
  const rows = o.items
    .map((i) => `<tr><td>${i.qty} × ${esc(i.name)} (${esc(i.size)}${i.color ? `, ${esc(i.color)}` : ""})</td><td align="right">${formatNaira(i.unitPriceKobo * i.qty)}</td></tr>`)
    .join("");
  const s = o.shipping;
  return `<div style="font-family:Arial,sans-serif;max-width:520px;color:#111">
<h2>Order ${esc(o.reference.slice(-8).toUpperCase())}</h2>
<table width="100%" cellpadding="4">${rows}
<tr><td>Delivery</td><td align="right">${formatNaira(o.shippingFeeKobo)}</td></tr>
<tr><td><strong>Total</strong></td><td align="right"><strong>${formatNaira(o.totalKobo)}</strong></td></tr></table>
<p>${esc(s.fullName)}<br>${esc(s.address)}, ${esc(s.city)}, ${esc(s.state)}<br>${esc(s.phone)}</p></div>`;
}

/**
 * Customer confirmation plus a "new order" note to the first ADMIN_EMAILS address.
 * Never throws: a mail problem must not block settling a paid order.
 */
export async function sendOrderEmails(o: OrderEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn("RESEND_API_KEY / EMAIL_FROM not set; skipping order emails");
    return;
  }
  const resend = new Resend(key);
  const owner = (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  const html = body(o);
  const jobs = [resend.emails.send({ from, to: o.email, subject: "Your XBK order is confirmed", html })];
  if (owner) jobs.push(resend.emails.send({ from, to: owner, subject: `New order ${o.reference.slice(-8).toUpperCase()}`, html }));
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === "rejected") console.error("Order email failed", r.reason);
    else if (r.value.error) console.error("Order email failed", r.value.error);
  }
}

/** Emails in `ADMIN_EMAILS` (comma-separated, lower-cased). */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const isAdminEmail = (email: string) => adminEmails().includes(email.toLowerCase());

/** Verification / password-reset mail. Never throws; skipped with a warning when Resend is unset. */
export async function sendAuthEmail(opts: { to: string; subject: string; heading: string; cta: string; url: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`RESEND_API_KEY / EMAIL_FROM not set; skipping "${opts.subject}" email`);
    return;
  }
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;color:#111">
<h2>${esc(opts.heading)}</h2>
<p><a href="${esc(opts.url)}" style="display:inline-block;padding:12px 24px;border-radius:30px;background:#111;color:#fff;text-decoration:none">${esc(opts.cta)}</a></p>
<p style="color:#707072;font-size:13px">If you didn't request this, you can ignore this email.</p></div>`;
  try {
    const r = await new Resend(key).emails.send({ from, to: opts.to, subject: opts.subject, html });
    if (r.error) console.error("Auth email failed", r.error);
  } catch (e) {
    console.error("Auth email failed", e);
  }
}

/** Branded plain-text message (paragraphs split on blank lines). Never throws; returns whether it was handed to Resend. */
export async function sendCustomerEmail(opts: { to: string | string[]; subject: string; text: string; footerHtml?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`RESEND_API_KEY / EMAIL_FROM not set; skipping "${opts.subject}" email`);
    return false;
  }
  const paragraphs = opts.text
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;color:#111;line-height:1.5">${paragraphs}${opts.footerHtml ?? ""}</div>`;
  try {
    const r = await new Resend(key).emails.send({ from, to: opts.to, subject: opts.subject, html });
    if (r.error) {
      console.error("Email failed", r.error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Email failed", e);
    return false;
  }
}
