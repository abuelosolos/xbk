import { put } from "@vercel/blob";

export const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Uploads the form's photo files to Vercel Blob and returns their public URLs. */
export async function uploadPhotos(files: FormDataEntryValue[], slug: string) {
  const photos = files.filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length === 0) return [];
  if (photos.length > MAX_PHOTOS) throw new Error(`Upload at most ${MAX_PHOTOS} photos`);
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  for (const f of photos) {
    if (!PHOTO_TYPES.has(f.type)) throw new Error(`${f.name}: use a JPEG, PNG or WebP image`);
    if (f.size > MAX_PHOTO_BYTES) throw new Error(`${f.name}: must be under 5 MB`);
  }
  const ext = (t: string) => (t === "image/png" ? "png" : t === "image/webp" ? "webp" : "jpg");
  const blobs = await Promise.all(
    photos.map((f, i) => put(`products/${slug}/${i + 1}.${ext(f.type)}`, f, { access: "public", addRandomSuffix: true })),
  );
  return blobs.map((b) => b.url);
}

