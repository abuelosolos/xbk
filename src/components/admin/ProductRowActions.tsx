"use client";

import Link from "next/link";
import { archiveProduct, deleteProduct, restoreProduct } from "@/app/admin/products/actions";
import { ActionForm } from "@/components/admin/ActionForm";

/** Edit / archive / restore, plus permanent delete for products that no order has ever contained. */
export function ProductRowActions({ id, name, archived, deletable }: { id: string; name: string; archived: boolean; deletable: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {!archived && <Link href={`/admin/products/${id}/edit`} className="font-medium underline underline-offset-4">Edit</Link>}
      <ActionForm action={archived ? restoreProduct : archiveProduct} submit={archived ? "Restore" : "Archive"} confirmText={archived ? undefined : `Archive ${name}? It will disappear from the shop but keep its order history.`}>
        <input type="hidden" name="id" value={id} />
      </ActionForm>
      {deletable && (
        <ActionForm action={deleteProduct} submit="Delete" confirmText={`Permanently delete ${name} and its photos? This can't be undone.`}>
          <input type="hidden" name="id" value={id} />
        </ActionForm>
      )}
    </div>
  );
}
