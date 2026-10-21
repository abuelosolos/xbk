export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Public Blob URLs look like https://<store>.public.blob.vercel-storage.com/<path>. */
export const isBlobUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
};

/** Problem with a chosen file, or undefined when it can be uploaded. */
export function photoFileProblem(f: { name: string; type: string; size: number }) {
  if (!PHOTO_TYPES.includes(f.type)) return `${f.name}: use a JPEG, PNG or WebP image.`;
  if (f.size > MAX_PHOTO_BYTES) return `${f.name}: must be under 5 MB.`;
  return undefined;
}
