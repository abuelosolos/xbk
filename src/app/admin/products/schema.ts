import { z } from "zod";
import { nairaToKobo } from "@/lib/utils";

const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

const naira = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount in naira, e.g. 25000 or 25000.50.")
  .transform(nairaToKobo)
  .refine((kobo) => kobo > 0, "Must be more than zero.")
  .refine((kobo) => kobo <= 2_000_000_000, "That amount is too large."); // integer column limit

const productFields = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120, "Keep the name under 120 characters."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes, e.g. road-runner."),
  subtitle: z.string().trim().min(2, "Enter a subtitle.").max(160, "Keep the subtitle under 160 characters."),
  category: z.string().trim().min(1), // category slug, picked from the form's dropdown
  subcategory: z.string().trim().optional(), // sub-category slug within that category
  gender: z.enum(["men", "women", "unisex"]),
  priceNaira: naira,
  saleNaira: naira.optional(),
  sizes: z.string().transform(csv).refine((a) => a.length > 0, "Add at least one size, separated by commas."),
  colors: z
    .string()
    .transform(csv) // "Black:#111111, White:#ffffff"
    .refine((a) => a.length > 0, "Add at least one colour, e.g. Black:#111111.")
    .refine(
      (a) => a.every((c) => !c.includes(":") || /^#[0-9a-f]{6}$/i.test(c.split(":")[1].trim())),
      "Colour codes look like #111111.",
    ),
  stock: z.coerce.number({ invalid_type_error: "Enter a whole number." }).int("Enter a whole number.").min(0, "Stock can't be negative.").max(1_000_000, "That stock level is too large."),
  badge: z.string().trim().optional(),
  description: z.string().trim().max(5000, "Keep the description under 5000 characters.").default(""),
});

const saleBelowPrice = {
  check: (v: { priceNaira: number; saleNaira?: number }) => v.saleNaira === undefined || v.saleNaira < v.priceNaira,
  message: { message: "Sale price must be below the price.", path: ["saleNaira"] },
};

/** Create: includes the opening stock. */
export const productSchema = productFields.refine(saleBelowPrice.check, saleBelowPrice.message);

/** Edit: stock is deliberately absent; it changes only through adjustStock so edits can't overwrite sales. */
export const productUpdateSchema = productFields.omit({ stock: true }).refine(saleBelowPrice.check, saleBelowPrice.message);
