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
