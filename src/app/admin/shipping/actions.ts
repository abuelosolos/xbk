"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { shippingRates } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { STATES } from "@/lib/states";
import { nairaToKobo } from "@/lib/utils";

export type ShippingFormState = { ok?: boolean; errors?: Record<string, string>; values?: Record<string, string> };

const days = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label}: whole days.` }).int(`${label}: whole days.`).min(0, `${label}: can't be negative.`).max(60, `${label}: at most 60.`);

const row = z
  .object({
    fee: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter naira, e.g. 3500.")
      .transform(nairaToKobo)
      .refine((k) => k > 0, "Must be more than zero."),
    min: days("Min"),
    max: days("Max"),
  })
  .refine((r) => r.min <= r.max, { message: "Min can't exceed max.", path: ["max"] });

/** Fields are named `fee:<State>`, `min:<State>`, `max:<State>`. Errors are keyed the same way. */
export async function updateShippingRates(_prev: ShippingFormState, formData: FormData): Promise<ShippingFormState> {
  await requireAdmin();

  const values = Object.fromEntries([...formData].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const errors: Record<string, string> = {};
  const rows: { state: string; feeKobo: number; minDays: number; maxDays: number; active: boolean }[] = [];

  for (const state of STATES) {
    const r = row.safeParse({ fee: values[`fee:${state}`] ?? "", min: values[`min:${state}`] ?? "", max: values[`max:${state}`] ?? "" });
    if (r.success) rows.push({ state, feeKobo: r.data.fee, minDays: r.data.min, maxDays: r.data.max, active: formData.has(`active:${state}`) });
    else for (const issue of r.error.issues) errors[`${String(issue.path[0])}:${state}`] ??= issue.message;
  }
  if (Object.keys(errors).length) return { errors, values };
  if (!rows.some((r) => r.active)) return { errors: { form: "Keep at least one state active." }, values };

  await getDb()
    .insert(shippingRates)
    .values(rows)
    .onConflictDoUpdate({
      target: shippingRates.state,
      set: {
        feeKobo: sql`excluded.fee_kobo`,
        minDays: sql`excluded.min_days`,
        maxDays: sql`excluded.max_days`,
        active: sql`excluded.active`,
        updatedAt: sql`now()`,
      },
    });

  revalidatePath("/checkout");
  revalidatePath("/account");
  revalidatePath("/admin/shipping");
  return { ok: true };
}
