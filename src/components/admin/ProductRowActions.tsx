"use client";

import Link from "next/link";
import { useState } from "react";
import { archiveProduct, deleteProduct, restoreProduct } from "@/app/admin/products/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { BottomSheet } from "@/components/admin/ui/BottomSheet";
import { ButtonLink } from "@/components/ui/Button";

/** Edit up front (md+); archive / restore / permanent delete (never-ordered products only) live in a sheet, so no scroll area can clip them. */
export function ProductRowActions({ id, name, slug, archived, deletable }: { id: string; name: string; slug: string; archived: boolean; deletable: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end gap-2">
      {!archived && <ButtonLink href={`/admin/products/${id}/edit`} variant="outline" size="sm" className="hidden md:inline-flex">Edit</ButtonLink>}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`More actions for ${name}`}
        aria-haspopup="dialog"
        className="flex size-11 items-center justify-center rounded-pill bg-white text-fs-16 transition hover:bg-hairline-soft md:size-9"
      >
        ⋯
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={name}>
        <div className="flex flex-col gap-1">
          {!archived && (
            <>
              <Link href={`/admin/products/${id}/edit`} className="flex h-12 items-center text-fs-16 font-medium">Edit product</Link>
              <Link href={`/product/${slug}`} className="flex h-12 items-center text-fs-16 font-medium">View in shop</Link>
            </>
          )}
          <ActionForm
            action={archived ? restoreProduct : archiveProduct}
            submit={archived ? "Restore" : "Archive"}
            confirmText={archived ? undefined : `Archive ${name}? It will disappear from the shop but keep its order history.`}
            className="flex items-center gap-2 py-2"
          >
            <input type="hidden" name="id" value={id} />
          </ActionForm>
          {deletable && (
            <ActionForm action={deleteProduct} submit="Delete" confirmText={`Permanently delete ${name} and its photos? This can't be undone.`} className="flex items-center gap-2 py-2">
              <input type="hidden" name="id" value={id} />
            </ActionForm>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
