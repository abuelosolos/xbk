"use client";

import { upload } from "@vercel/blob/client";
import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/products/actions";
import { CategoryFields } from "@/components/admin/CategoryFields";
import { StickyActionBar } from "@/components/admin/ui/StickyActionBar";
import { FormSection } from "@/components/admin/ui/layout";
import { Button } from "@/components/ui/Button";
import { Field, FieldWrap, fieldCompactClass } from "@/components/ui/Field";
import type { Category, Product } from "@/lib/types";
import { MAX_PHOTOS, photoFileProblem } from "@/lib/uploads-config";

const photoButton = "inline-flex h-10 min-w-10 items-center justify-center rounded-pill bg-cloud px-3 text-fs-14 font-medium transition hover:bg-hairline-soft disabled:opacity-40";
const label = "mb-1 block text-fs-14 text-mute";

/** Create form, or the edit form when `product` is given. */
export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(product ? updateProduct.bind(null, product.id) : createProduct, {});
  const initial: Record<string, string> = product
    ? {
        name: product.name, slug: product.slug, subtitle: product.subtitle, category: product.category, subcategory: product.subcategory ?? "",
        gender: product.gender, priceNaira: String(product.priceKobo / 100), saleNaira: product.salePriceKobo ? String(product.salePriceKobo / 100) : "",
        sizes: product.sizes.join(", "), colors: product.colors.map((c) => `${c.name}:${c.hex}`).join(", "), stock: String(product.stock),
        badge: product.badge ?? "", description: product.description,
      }
    : {};
  // Photos upload straight to Blob as soon as they are chosen; the form submits only their URLs, in order.
  const [photos, setPhotos] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState<Record<string, number>>({}); // file name → percent
  const [photoError, setPhotoError] = useState<string | undefined>();
  // which colour each photo belongs to ("" = shown for every colour that has no photos of its own)
  const [photoColors, setPhotoColors] = useState<Record<string, string>>(
    Object.fromEntries((product?.colors ?? []).flatMap((c) => (c.images ?? []).map((url) => [url, c.name]))),
  );
  const [colorNames, setColorNames] = useState<string[]>(product?.colors.map((c) => c.name) ?? []);
  const e = state.errors ?? {};
  const v = state.values ?? initial;
  // changes whenever a result comes back, so fields re-read their defaultValue after the form resets
  const key = state.ok ? "saved" : JSON.stringify(state.errors ?? {});
  const busy = Object.keys(uploading).length > 0;

  useEffect(() => {
    if (state.ok && !product) setPhotos([]);
  }, [state.ok, product]);

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    if (photos.length + files.length > MAX_PHOTOS) return setPhotoError(`A product can have at most ${MAX_PHOTOS} photos.`);
    const problem = files.map(photoFileProblem).find(Boolean);
    if (problem) return setPhotoError(problem);
    setPhotoError(undefined);
    const results = await Promise.all(
      files.map(async (f) => {
        setUploading((u) => ({ ...u, [f.name]: 0 }));
        try {
          const blob = await upload(`products/${f.name}`, f, {
            access: "public",
            handleUploadUrl: "/admin/blob-upload",
            onUploadProgress: ({ percentage }) => setUploading((u) => ({ ...u, [f.name]: Math.round(percentage) })),
          });
          return { url: blob.url };
        } catch (err) {
          return { error: `${f.name}: ${err instanceof Error ? err.message : "upload failed."}` };
        } finally {
          setUploading(({ [f.name]: _done, ...rest }) => rest);
        }
      }),
    );
    setPhotos((p) => [...p, ...results.flatMap((r) => ("url" in r && r.url ? [r.url] : []))]);
    setPhotoError(results.find((r) => "error" in r)?.error);
  }

  const move = (i: number, by: -1 | 1) =>
    setPhotos((p) => {
      const next = [...p];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });

  return (
    <form
      key={key}
      action={action}
      noValidate
      onInput={(ev) => {
        const t = ev.target as HTMLInputElement;
        if (t.name === "colors") setColorNames(t.value.split(",").map((c) => c.split(":")[0].trim()).filter(Boolean));
      }}
      onSubmit={(ev) => {
        if (busy) {
          setPhotoError("Wait for the photos to finish uploading.");
          ev.preventDefault();
        }
      }}
      className="max-w-[960px]"
    >
      <FormSection title="Basics" hint="The name, URL and category shoppers see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field compact labelVisible label="Name" name="name" defaultValue={v.name} error={e.name} placeholder="Road Runner" />
          <Field compact labelVisible label="Slug (web address)" name="slug" defaultValue={v.slug} error={e.slug} placeholder="road-runner" />
          <Field
            compact
            labelVisible
            label="Subtitle"
            name="subtitle"
            defaultValue={v.subtitle}
            error={e.subtitle}
            placeholder="Men's Road Running Shoes"
            wrapperClassName="sm:col-span-2"
          />
          <CategoryFields categories={categories} className={fieldCompactClass} defaultCategory={v.category} defaultSubcategory={v.subcategory} />
          <label className="block">
            <span className={label}>Gender</span>
            <select name="gender" className={fieldCompactClass} defaultValue={v.gender ?? "unisex"}>
              <option value="men">Men</option><option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>
          <Field compact labelVisible label="Badge (optional)" name="badge" defaultValue={v.badge} placeholder="New" />
          {e.category && <p role="alert" className="text-fs-14 font-medium text-sale sm:col-span-2">{e.category}</p>}
        </div>
      </FormSection>

      <FormSection title="Pricing" hint="Prices in naira. A sale price must be lower than the price.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field compact labelVisible label="Price (₦)" name="priceNaira" inputMode="decimal" defaultValue={v.priceNaira} error={e.priceNaira} placeholder="25000" />
          <Field compact labelVisible label="Sale price (₦, optional)" name="saleNaira" inputMode="decimal" defaultValue={v.saleNaira} error={e.saleNaira} placeholder="20000" />
        </div>
      </FormSection>

      <FormSection title="Variants and stock" hint="Separate sizes with commas. Colours are Name:#hex.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field compact labelVisible label="Sizes" name="sizes" defaultValue={v.sizes} error={e.sizes} placeholder="S, M, L" />
          <Field compact labelVisible label="Colours" name="colors" defaultValue={v.colors} error={e.colors} placeholder="Black:#111111, White:#ffffff" />
          {product ? (
            <p className="text-fs-14 text-mute sm:col-span-2">
              In stock: <span className="font-medium text-ink">{product.stock}</span>. Change it under Inventory so sales and edits never overwrite each other.
            </p>
          ) : (
            <Field compact labelVisible label="Opening stock" name="stock" inputMode="numeric" defaultValue={v.stock ?? "0"} error={e.stock} placeholder="0" />
          )}
        </div>
      </FormSection>

      <FormSection title="Photos" hint={`Up to ${MAX_PHOTOS} images (JPEG, PNG or WebP, 5 MB each). The first is the main image. With several colours, pick which colour each photo shows for.`}>
        {photos.map((url) => (
          <span key={url} hidden>
            <input type="hidden" name="photo" value={url} />
            <input type="hidden" name="photoColor" value={colorNames.includes(photoColors[url]) ? photoColors[url] : ""} />
          </span>
        ))}
        <FieldWrap error={photoError ?? e.photos}>
          {photos.length > 0 && (
            <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((url, i) => (
                <li key={url} className="rounded-xl border border-hairline-soft p-2 text-center text-fs-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-square w-full rounded-lg bg-cloud object-cover" />
                  <span className="mt-2 block text-mute">{i === 0 ? "Main image" : `Image ${i + 1}`}</span>
                  {colorNames.length > 1 && (
                    <select
                      aria-label={`Colour for photo ${i + 1}`}
                      value={colorNames.includes(photoColors[url]) ? photoColors[url] : ""}
                      onChange={(ev) => setPhotoColors((m) => ({ ...m, [url]: ev.target.value }))}
                      className="mt-2 h-10 w-full rounded-pill border border-hairline bg-white px-3 text-fs-14"
                    >
                      <option value="">Default (no colour)</option>
                      {colorNames.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  )}
                  <span className="mt-2 flex justify-center gap-1">
                    <button type="button" className={photoButton} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move photo ${i + 1} earlier`}>←</button>
                    <button type="button" className={photoButton} disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label={`Move photo ${i + 1} later`}>→</button>
                    <button type="button" className={photoButton} onClick={() => setPhotos((p) => p.filter((u) => u !== url))} aria-label={`Remove photo ${i + 1}`}>✕</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-label="Add photos"
            disabled={photos.length >= MAX_PHOTOS}
            onChange={(ev) => {
              void addFiles(ev.currentTarget.files);
              ev.currentTarget.value = "";
            }}
            className="block w-full text-fs-14 text-ink file:mr-3 file:h-10 file:cursor-pointer file:rounded-pill file:border-0 file:bg-cloud file:px-4 file:text-fs-14 file:font-medium"
          />
          {busy && (
            <p role="status" className="mt-2 text-fs-14 text-mute">
              Uploading {Object.entries(uploading).map(([name, pct]) => `${name} ${pct}%`).join(", ")}…
            </p>
          )}
        </FieldWrap>
      </FormSection>

      <FormSection title="Description" hint="Shown on the product page.">
        <textarea name="description" rows={5} defaultValue={v.description} aria-label="Description" placeholder="Describe the product" className={`${fieldCompactClass} h-auto py-3`} />
      </FormSection>

      <StickyActionBar>
        <Button type="submit" disabled={pending || busy}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</Button>
        {busy && <span className="text-fs-14 text-mute">Uploading photos…</span>}
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">{product ? "Changes saved." : "Product created."}</p>}
      </StickyActionBar>
    </form>
  );
}
