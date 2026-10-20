import { hasDb } from "@/db";
import { Button } from "@/components/ui/Button";
import { getAllProducts } from "@/lib/products";
import { formatNaira } from "@/lib/utils";
import { createProduct } from "./actions";

export const dynamic = "force-dynamic";

const input =
  "h-11 w-full rounded-field border border-hairline bg-white px-4 text-fs-14 outline-none focus:border-ink focus:ring-2 focus:ring-ink";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <h1 className="mb-6 text-fs-32 font-medium leading-tight">Products</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-fs-14">
          <thead className="border-b border-hairline text-mute">
            <tr>
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Category</th>
              <th className="py-3 pr-4 font-medium">Price</th>
              <th className="py-3 pr-4 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4 font-medium">{p.name}</td>
                <td className="py-3 pr-4 capitalize">{p.category}{p.subcategory && ` / ${p.subcategory}`} · {p.gender}</td>
                <td className="py-3 pr-4">
                  {p.salePriceKobo ? <><span className="text-sale">{formatNaira(p.salePriceKobo)}</span> <span className="text-mute line-through">{formatNaira(p.priceKobo)}</span></> : formatNaira(p.priceKobo)}
                </td>
                <td className="py-3 pr-4">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 mt-12 text-fs-24 font-medium">New product</h2>
      {!hasDb() ? (
        <p className="bg-cloud p-4 text-fs-14 text-charcoal">Set DATABASE_URL to create products.</p>
      ) : (
        <form action={createProduct} className="grid max-w-2xl gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Name" className={input} />
          <input name="slug" required placeholder="slug-like-this" className={input} />
          <input name="subtitle" required placeholder="Subtitle (e.g. Men's Road Running Shoes)" className={`${input} sm:col-span-2`} />
          <input name="category" required placeholder="Category (footwear, clothing…)" className={input} />
          <input name="subcategory" placeholder="Subcategory (running, tops…; optional)" className={input} />
          <select name="gender" className={input} defaultValue="unisex">
            <option value="men">Men</option><option value="women">Women</option>
            <option value="kids">Kids</option><option value="unisex">Unisex</option>
          </select>
          <input name="priceNaira" type="number" min="1" step="any" required placeholder="Price (₦)" className={input} />
          <input name="saleNaira" type="number" min="1" step="any" placeholder="Sale price (₦, optional)" className={input} />
          <input name="sizes" required placeholder="Sizes: S, M, L" className={input} />
          <input name="colors" required placeholder="Colours: Black:#111111, White:#ffffff" className={input} />
          <input name="stock" type="number" min="0" required defaultValue={0} placeholder="Stock" className={input} />
          <input name="badge" placeholder="Badge (optional)" className={input} />
          <textarea name="description" rows={3} placeholder="Description" className={`${input} h-auto py-3 sm:col-span-2`} />
          <Button type="submit" className="sm:col-span-2 sm:w-fit">Create product</Button>
        </form>
      )}
    </>
  );
}
