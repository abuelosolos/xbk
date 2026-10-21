"use client";

import { upload } from "@vercel/blob/client";
import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/products/actions";
import { CategoryFields } from "@/components/admin/CategoryFields";
import { Button } from "@/components/ui/Button";
import { Field, FieldWrap, fieldCompactClass } from "@/components/ui/Field";
import type { Category, Product } from "@/lib/types";
import { MAX_PHOTOS, photoFileProblem } from "@/lib/uploads-config";

const photoButton = "h-8 rounded-pill bg-cloud px-3 text-fs-12 font-medium disabled:opacity-40";

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
      onSubmit={(ev) => {
        if (busy) {
          setPhotoError("Wait for the photos to finish uploading.");
          ev.preventDefault();
        }
      }}
      className="grid max-w-2xl gap-3 sm:grid-cols-2"
    >
      <Field compact label="Name" name="name" defaultValue={v.name} error={e.name} placeholder="Name" />
      <Field compact label="Slug" name="slug" defaultValue={v.slug} error={e.slug} placeholder="slug-like-this" />
      <Field
        compact
        label="Subtitle"
        name="subtitle"
        defaultValue={v.subtitle}
        error={e.subtitle}
        placeholder="Subtitle (e.g. Men's Road Running Shoes)"
        wrapperClassName="sm:col-span-2"
      />
      <CategoryFields categories={categories} className={fieldCompactClass} defaultCategory={v.category} defaultSubcategory={v.subcategory} />
      <select name="gender" className={fieldCompactClass} defaultValue={v.gender ?? "unisex"} aria-label="Gender">
        <option value="men">Men</option><option value="women">Women</option>
        <option value="kids">Kids</option><option value="unisex">Unisex</option>
      </select>
      <Field compact label="Price in naira" name="priceNaira" inputMode="decimal" defaultValue={v.priceNaira} error={e.priceNaira} placeholder="Price (₦)" />
      <Field compact label="Sale price in naira" name="saleNaira" inputMode="decimal" defaultValue={v.saleNaira} error={e.saleNaira} placeholder="Sale price (₦, optional)" />
      <Field compact label="Sizes" name="sizes" defaultValue={v.sizes} error={e.sizes} placeholder="Sizes: S, M, L" />
      <Field compact label="Colours" name="colors" defaultValue={v.colors} error={e.colors} placeholder="Colours: Black:#111111, White:#ffffff" />
      {product ? (
        <p className="text-fs-14 text-mute">Stock: <span className="font-medium text-ink">{product.stock}</span>. Change it under Inventory so sales and edits never overwrite each other.</p>
      ) : (
        <Field compact label="Stock" name="stock" inputMode="numeric" defaultValue={v.stock ?? "0"} error={e.stock} placeholder="Stock" />
      )}
      <Field compact label="Badge" name="badge" defaultValue={v.badge} placeholder="Badge (optional)" />
      {photos.map((url) => (
        <input key={url} type="hidden" name="photo" value={url} />
      ))}
      <FieldWrap error={photoError ?? e.photos} className="sm:col-span-2">
        <div className="block text-fs-14 text-mute">
          Photos (JPEG, PNG or WebP, up to {MAX_PHOTOS} images, 5 MB each; the first is the main image)
          {photos.length > 0 && (
            <ul className="my-2 flex flex-wrap gap-3">
              {photos.map((url, i) => (
                <li key={url} className="text-center text-fs-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-20 bg-cloud object-cover" />
                  <span className="mt-1 block text-mute">{i === 0 ? "Main" : `#${i + 1}`}</span>
                  <span className="mt-1 flex justify-center gap-1">
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
            disabled={photos.length >= MAX_PHOTOS}
            onChange={(ev) => {
              void addFiles(ev.currentTarget.files);
              ev.currentTarget.value = "";
            }}
            className="mt-1 block w-full text-fs-14 text-ink file:mr-3 file:h-9 file:rounded-pill file:border-0 file:bg-cloud file:px-4 file:text-fs-14 file:font-medium"
          />
        </div>
        {busy && (
          <p role="status" className="mt-1 text-fs-14 text-mute">
            Uploading {Object.entries(uploading).map(([name, pct]) => `${name} ${pct}%`).join(", ")}…
          </p>
        )}
      </FieldWrap>
      <textarea name="description" rows={3} defaultValue={v.description} aria-label="Description" placeholder="Description" className={`${fieldCompactClass} h-auto py-3 sm:col-span-2`} />
      {e.category && <p role="alert" className="text-fs-14 font-medium text-sale sm:col-span-2">{e.category}</p>}
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={pending || busy}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</Button>
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">{product ? "Changes saved." : "Product created."}</p>}
      </div>
    </form>
  );
}
