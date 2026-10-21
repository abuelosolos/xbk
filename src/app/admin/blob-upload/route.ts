import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/uploads-config";

/** Issues short-lived client tokens so the admin's browser can upload product photos straight to Blob. */
export async function POST(request: Request) {
  await requireAdmin("/admin/products");
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: PHOTO_TYPES,
        maximumSizeInBytes: MAX_PHOTO_BYTES,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
