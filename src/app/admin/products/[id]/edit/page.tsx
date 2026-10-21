import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDb } from "@/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories, getProductById } from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}/edit`);
  if (!hasDb() || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/products" className="text-fs-14 text-mute underline underline-offset-4">All products</Link>
      <h1 className="mb-6 mt-2 text-fs-32 font-medium leading-tight">Edit {product.name}</h1>
      <ProductForm key={product.id} categories={categories} product={product} />
    </>
  );
}
