import Link from "next/link";
import { hasDb } from "@/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin("/admin/products/new");
  const categories = await getCategories();
  return (
    <>
      <Link href="/admin/products" className="text-fs-14 text-mute underline underline-offset-4">All products</Link>
      <h1 className="mb-6 mt-2 text-fs-32 font-medium leading-tight">New product</h1>
      {hasDb() ? <ProductForm categories={categories} /> : <p className="bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to create products.</p>}
    </>
  );
}
