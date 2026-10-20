import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader. Unsplash CDN links (see lib/images.ts) are resized by the
 * CDN itself via `w`, so the browser loads them directly at the requested width.
 * Anything else (local files) is served as-is.
 */
export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    return url.toString();
  }
  return src;
}
