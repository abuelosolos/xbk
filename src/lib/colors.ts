import type { Product, ProductColor } from "./types";

/** Photos for the chosen colour; a colour without its own photos shows the product's full gallery. */
export function galleryFor(product: Pick<Product, "images" | "colors">, colorIdx: number): string[] {
  const own = product.colors[colorIdx]?.images;
  return own && own.length > 0 ? own : product.images;
}

/**
 * Attaches each photo to the colour named in `tags` (photo URL -> colour name), keeping the photo order.
 * A colour with no tagged photos gets no `images` key, so it falls back to the whole gallery.
 */
export function withColorPhotos(colors: ProductColor[], images: string[], tags: ReadonlyMap<string, string>): ProductColor[] {
  return colors.map(({ name, hex }) => {
    const own = images.filter((url) => tags.get(url) === name);
    return own.length > 0 ? { name, hex, images: own } : { name, hex };
  });
}
