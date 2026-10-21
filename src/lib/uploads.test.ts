import { describe, expect, it } from "vitest";
import { parsePhotoUrls } from "./uploads";
import { isBlobUrl, photoFileProblem } from "./uploads-config";

const blob = "https://abc123.public.blob.vercel-storage.com/products/a-xyz.jpg";

describe("isBlobUrl", () => {
  it("accepts public Blob URLs only", () => {
    expect(isBlobUrl(blob)).toBe(true);
    expect(isBlobUrl("http://abc.public.blob.vercel-storage.com/a.jpg")).toBe(false);
    expect(isBlobUrl("https://evil.com/public.blob.vercel-storage.com/a.jpg")).toBe(false);
    expect(isBlobUrl("not a url")).toBe(false);
  });
});

describe("parsePhotoUrls", () => {
  it("keeps order, dedupes, and drops foreign URLs", () => {
    const old = "https://images.unsplash.com/photo-1";
    expect(parsePhotoUrls([blob, old, "https://evil.com/x.jpg", blob, new File([], "f")], [old])).toEqual([blob, old]);
  });
});

describe("photoFileProblem", () => {
  it("checks type and size", () => {
    expect(photoFileProblem({ name: "a.jpg", type: "image/jpeg", size: 1000 })).toBeUndefined();
    expect(photoFileProblem({ name: "a.gif", type: "image/gif", size: 1000 })).toMatch(/JPEG/);
    expect(photoFileProblem({ name: "a.png", type: "image/png", size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
  });
});
