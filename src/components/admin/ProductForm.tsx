"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/products/actions";
import { CategoryFields } from "@/components/admin/CategoryFields";
import { Button } from "@/components/ui/Button";
import { Field, FieldWrap, fieldCompactClass } from "@/components/ui/Field";
import type { Category, Product } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function photoProblem(files: FileList | null) {
  if (!files || files.length === 0) return undefined;
  if (files.length > MAX_PHOTOS) return `Choose at most ${MAX_PHOTOS} photos.`;
  for (const f of Array.from(files)) {
    if (!PHOTO_TYPES.includes(f.type)) return `${f.name}: use a JPEG, PNG or WebP image.`;
    if (f.size > MAX_PHOTO_BYTES) return `${f.name}: must be under 5 MB.`;
  }
  return undefined;
}

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
  const [photoError, setPhotoError] = useState<string | undefined>();
  const e = state.errors ?? {};
  const v = state.values ?? initial;
  // changes whenever a result comes back, so fields re-read their defaultValue after the form resets
  const key = state.ok ? "saved" : JSON.stringify(state.errors ?? {});

  return (
    <form
      key={key}
      action={action}
      noValidate
      onSubmit={(ev) => {
        const problem = photoProblem(ev.currentTarget.photos.files);
        setPhotoError(problem);
        if (problem) ev.preventDefault();
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
      {product && product.images.length > 0 && (
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-fs-14 text-mute">Current photos (untick to remove)</legend>
          <div className="flex flex-wrap gap-3">
            {product.images.map((url) => (
              <label key={url} className="block text-center text-fs-12 text-mute">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-20 bg-cloud object-cover" />
                <input type="checkbox" name="keep" value={url} defaultChecked className="mt-1 size-4 accent-ink" />
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <FieldWrap error={photoError ?? e.photos} className="sm:col-span-2">
        <label className="block text-fs-14 text-mute">
          Photos (JPEG, PNG or WebP, up to 6 images, 5 MB each; the first is the main image)
          <input
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(ev) => setPhotoError(photoProblem(ev.currentTarget.files))}
            className="mt-1 block w-full text-fs-14 text-ink file:mr-3 file:h-9 file:rounded-pill file:border-0 file:bg-cloud file:px-4 file:text-fs-14 file:font-medium"
          />
        </label>
      </FieldWrap>
      <textarea name="description" rows={3} defaultValue={v.description} aria-label="Description" placeholder="Description" className={`${fieldCompactClass} h-auto py-3 sm:col-span-2`} />
      {e.category && <p role="alert" className="text-fs-14 font-medium text-sale sm:col-span-2">{e.category}</p>}
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</Button>
        {state.ok && <p role="status" className="text-fs-14 font-medium text-success">{product ? "Changes saved." : "Product created."}</p>}
      </div>
    </form>
  );
}
