import { del } from "@vercel/blob";
import { MAX_PHOTOS, isBlobUrl } from "./uploads-config";

export { MAX_PHOTOS };

/**
 * The photo URLs submitted by the product form, in display order. Photos are uploaded straight from the
 * browser to Blob (see app/admin/blob-upload), so the action only ever sees URLs. A URL is accepted when
 * it is one the product already has or a Blob URL; anything else is dropped.
 */
export function parsePhotoUrls(values: FormDataEntryValue[], existing: string[] = []) {
  const urls = values.filter((v): v is string => typeof v === "string" && (existing.includes(v) || isBlobUrl(v)));
  return [...new Set(urls)];
}

/** Best-effort removal of Blob files; a failure here must never fail the save that triggered it. */
export async function deleteBlobs(urls: string[]) {
  const blobs = urls.filter(isBlobUrl);
  if (blobs.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(blobs);
  } catch (err) {
    console.error("Deleting product photos failed", err);
  }
}
