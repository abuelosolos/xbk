import { revalidatePath } from "next/cache";

/**
 * One place that knows which cached pages show catalogue data. Pages also carry `revalidate = 300`
 * as a backstop for anything not listed here (related-product rows, category names on other pages).
 * Revalidating is not allowed while a Server Component renders (e.g. the checkout success page), so
 * failures are ignored there; the webhook path does the refresh.
 */
export function revalidateCatalogue(slugs: string | string[] = []) {
  try {
    for (const slug of [slugs].flat()) revalidatePath(`/product/${slug}`);
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/[hub]", "page");
    revalidatePath("/product/[slug]", "page");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
  } catch {
    /* rendering context */
  }
}
