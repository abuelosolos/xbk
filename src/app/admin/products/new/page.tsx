import { Notice, PageHeader } from "@/components/admin/ui/layout";
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
      <PageHeader title="New product" back={{ href: "/admin/products", label: "All products" }} />
      {hasDb() ? <ProductForm categories={categories} /> : <Notice>Set DATABASE_URL to create products.</Notice>}
    </>
  );
}
