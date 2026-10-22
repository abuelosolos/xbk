import { notFound } from "next/navigation";
import { hasDb } from "@/db";
import { PageHeader } from "@/components/admin/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
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
      <PageHeader
        title={`Edit ${product.name}`}
        back={{ href: "/admin/products", label: "All products" }}
        actions={<ButtonLink href={`/product/${product.slug}`} variant="outline" size="sm">View in shop</ButtonLink>}
      />
      <ProductForm key={product.id} categories={categories} product={product} />
    </>
  );
}
