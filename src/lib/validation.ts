import { z } from "zod";
import { normalizeState, STATES } from "@/lib/states";

/** Shared client + server field rules. Messages are shown to customers verbatim. */

export const PHONE_PREFIX = "+234";

/** Reduces anything a user types or pastes (0803…, +234803…, 803 123 4567) to at most 10 national digits. */
export function nationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("234") && (raw.trim().startsWith("+") || d.length > 10)) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

/** "+234" + digits, or "" when nothing has been typed. */
export const toFullPhone = (digits: string) => (digits ? PHONE_PREFIX + digits : "");

/** Normalises stored phones (older rows have no prefix) to the +234 form. */
export function formatPhone(stored: string): string {
  const d = stored.replace(/\D/g, "");
  return d.length >= 10 ? PHONE_PREFIX + d.slice(-10) : stored;
}

export const phone = z
  .string()
  .trim()
  .regex(/^\+234[789]\d{9}$/, "Enter a valid 10-digit number, e.g. 803 123 4567.");

export const email = z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address.");
export const newPassword = z.string().min(8, "Use at least 8 characters.");
export const fullName = z.string().trim().min(2, "Enter your full name.");
export const postalCode = z
  .string()
  .trim()
  .regex(/^(\d{6})?$/, "Postal code is 6 digits.")
  .default("");

export const shippingSchema = z.object({
  fullName,
  phone,
  address: z.string().trim().min(5, "Enter your street address."),
  city: z.string().trim().min(2, "Enter your city."),
  state: z
    .string()
    .transform((s) => normalizeState(s) ?? "")
    .pipe(z.enum(STATES, { errorMap: () => ({ message: "Choose your state." }) })),
  postalCode,
});

/** First message per field, keyed by field name. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}
