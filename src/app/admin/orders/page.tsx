import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import { getDb, hasDb } from "@/db";
import { orders } from "@/db/schema";
import { formatNaira } from "@/lib/utils";
import { markShipped } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = hasDb() ? await getDb().select().from(orders).orderBy(desc(orders.createdAt)).limit(100) : [];

  return (
    <>
      <h1 className="mb-6 text-fs-32 font-medium leading-tight">Orders</h1>
      {rows.length === 0 ? (
        <p className="text-fs-16 text-mute">{hasDb() ? "No orders yet." : "Set DATABASE_URL to see orders."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-fs-14">
            <thead className="border-b border-hairline text-mute">
              <tr>
                <th className="py-3 pr-4 font-medium">Ref</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4 font-medium">{o.reference.slice(-8).toUpperCase()}</td>
                  <td className="py-3 pr-4">{o.shipping.fullName}<br /><span className="text-mute">{o.email}</span></td>
                  <td className="py-3 pr-4">{formatNaira(o.totalKobo)}</td>
                  <td className="py-3 pr-4 capitalize">{o.status}</td>
                  <td className="py-3 text-right">
                    {o.status === "paid" && (
                      <form action={markShipped}>
                        <input type="hidden" name="id" value={o.id} />
                        <Button type="submit" size="sm" variant="secondary">Mark shipped</Button>
                      </form>
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
