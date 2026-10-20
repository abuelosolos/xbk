import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader. Unsplash photo links (see lib/images.ts) are download
 * endpoints that redirect to the CDN file, which the hosted image optimizer
 * won't follow, so the browser loads them directly at the requested width.
 * Anything else (local files) is served as-is.
 */
export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("https://unsplash.com/photos/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    return url.toString();
  }
  return src;
}
