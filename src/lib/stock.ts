import { z } from "zod";

/** Client-safe stock rules shared by the admin UI, server actions and storefront (no database imports). */
export const MAX_STOCK = 1_000_000;
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "out" | "low" | "in";
export const stockStatus = (stock: number): StockStatus => (stock <= 0 ? "out" : stock <= LOW_STOCK_THRESHOLD ? "low" : "in");
export const STOCK_STATUS_LABEL: Record<StockStatus, string> = { out: "Sold out", low: "Low", in: "In stock" };

/** Reasons an admin can pick; `sale` and `initial` are written by the system only. */
export const ADMIN_REASONS = ["restock", "correction", "damaged", "return"] as const;
export const REASON_LABEL: Record<string, string> = {
  restock: "Restock",
  correction: "Correction",
  damaged: "Damaged / lost",
  return: "Customer return",
  sale: "Sale",
  initial: "Opening stock",
};

export const stockAdjustSchema = z.object({
  sign: z.enum(["+", "-"], { errorMap: () => ({ message: "Use the + or − button." }) }),
  amount: z.coerce
    .number({ invalid_type_error: "Enter a whole number." })
    .int("Enter a whole number.")
    .min(1, "Enter an amount above zero.")
    .max(MAX_STOCK, "That amount is too large."),
  reason: z.enum(ADMIN_REASONS, { errorMap: () => ({ message: "Choose a reason." }) }),
  note: z.string().trim().max(200, "Keep the note under 200 characters.").optional(),
});

/** Total requested quantity per product (one product can appear in several size lines). */
export function sumQtyByProduct(items: { productId: string; qty: number }[]) {
  const totals = new Map<string, number>();
  for (const i of items) totals.set(i.productId, (totals.get(i.productId) ?? 0) + i.qty);
  return totals;
}
