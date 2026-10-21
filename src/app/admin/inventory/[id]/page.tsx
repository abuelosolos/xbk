import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDb } from "@/db";
import { getProductById, getStockMovements } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { REASON_LABEL } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function StockHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/inventory/${id}`);
  if (!hasDb() || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const product = await getProductById(id);
  if (!product) notFound();
  const movements = await getStockMovements(id);

  return (
    <>
      <Link href="/admin/inventory" className="text-fs-14 text-mute underline underline-offset-4">Inventory</Link>
      <h1 className="mb-1 mt-2 text-fs-32 font-medium leading-tight">{product.name}</h1>
      <p className="mb-6 text-fs-16 text-mute">Current stock: <span className="font-medium text-ink">{product.stock}</span>. Showing the latest {movements.length} changes.</p>

      {movements.length === 0 ? (
        <p className="text-fs-16 text-mute">No recorded changes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-fs-14">
            <thead className="border-b border-hairline text-mute">
              <tr>
                <th className="py-3 pr-4 font-medium">When</th>
                <th className="py-3 pr-4 font-medium">Change</th>
                <th className="py-3 pr-4 font-medium">Stock after</th>
                <th className="py-3 pr-4 font-medium">Reason</th>
                <th className="py-3 font-medium">By / order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 pr-4 whitespace-nowrap">{m.createdAt.toLocaleString("en-NG")}</td>
                  <td className="py-3 pr-4 font-medium tabular-nums">
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                    {m.shortfall > 0 && <span className="ml-2 text-fs-12 font-normal text-mute">{m.shortfall} short</span>}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{m.stockAfter}</td>
                  <td className="py-3 pr-4">
                    {REASON_LABEL[m.reason] ?? m.reason}
                    {m.note && <span className="block text-mute">{m.note}</span>}
                  </td>
                  <td className="py-3">
                    {m.orderId ? (
                      <Link href={`/admin/orders/${m.orderId}`} className="underline underline-offset-4">{m.orderReference?.slice(-8).toUpperCase()}</Link>
                    ) : (
                      (m.actorName ?? "—")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
