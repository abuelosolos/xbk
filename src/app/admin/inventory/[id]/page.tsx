import Link from "next/link";
import { Card, DataTable, EmptyState, PageHeader, ResponsiveTable, td } from "@/components/admin/ui/layout";
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
      <PageHeader
        title={product.name}
        back={{ href: "/admin/inventory", label: "Inventory" }}
        description={<>Current stock: <span className="font-medium text-ink">{product.stock}</span>. Showing the latest {movements.length} changes.</>}
      />
      <Card flush>
        {movements.length === 0 ? (
          <EmptyState title="No recorded changes yet" />
        ) : (
          <ResponsiveTable
            cards={movements.map((m) => (
              <li key={m.id} className="px-4 py-3 text-fs-14">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-fs-16 font-medium tabular-nums">
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                    {m.shortfall > 0 && <span className="ml-2 text-fs-12 font-normal text-mute">{m.shortfall} short</span>}
                  </span>
                  <span className="text-mute">Stock {m.stockAfter}</span>
                </div>
                <p>{REASON_LABEL[m.reason] ?? m.reason}{m.note && <span className="text-mute"> · {m.note}</span>}</p>
                <p className="text-mute">
                  {m.createdAt.toLocaleString("en-NG")} ·{" "}
                  {m.orderId ? <Link href={`/admin/orders/${m.orderId}`} className="underline underline-offset-4">{m.orderReference?.slice(-8).toUpperCase()}</Link> : (m.actorName ?? "—")}
                </p>
              </li>
            ))}
          >
          <DataTable head={[{ label: "When" }, { label: "Change", align: "right" }, { label: "Stock after", align: "right" }, { label: "Reason" }, { label: "By / order" }]}>
            {movements.map((m) => (
              <tr key={m.id} className="transition hover:bg-cloud">
                <td className={`${td} whitespace-nowrap`}>{m.createdAt.toLocaleString("en-NG")}</td>
                <td className={`${td} text-right font-medium tabular-nums`}>
                  {m.delta > 0 ? `+${m.delta}` : m.delta}
                  {m.shortfall > 0 && <span className="ml-2 text-fs-12 font-normal text-mute">{m.shortfall} short</span>}
                </td>
                <td className={`${td} text-right tabular-nums`}>{m.stockAfter}</td>
                <td className={td}>
                  {REASON_LABEL[m.reason] ?? m.reason}
                  {m.note && <span className="block text-mute">{m.note}</span>}
                </td>
                <td className={td}>
                  {m.orderId ? (
                    <Link href={`/admin/orders/${m.orderId}`} className="underline underline-offset-4">{m.orderReference?.slice(-8).toUpperCase()}</Link>
                  ) : (
                    (m.actorName ?? "—")
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
          </ResponsiveTable>
        )}
      </Card>
    </>
  );
}
