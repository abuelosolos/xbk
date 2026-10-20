import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getDb, hasDb } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser("/account");
  const myOrders = hasDb()
    ? await getDb().select().from(orders).where(eq(orders.userId, session.user.id)).orderBy(desc(orders.createdAt))
    : [];

  return (
    <div className="mx-auto max-w-[900px] px-4 pt-10 lg:px-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-fs-32 font-medium leading-tight">{session.user.name}</h1>
          <p className="text-fs-16 text-mute">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mb-4 mt-12 text-fs-24 font-medium">Orders</h2>
      {myOrders.length === 0 ? (
        <p className="text-fs-16 text-mute">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="divide-y divide-hairline-soft border-y border-hairline-soft">
          {myOrders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 py-5">
              <div>
                <p className="text-fs-16 font-medium">Order {o.reference.slice(-8).toUpperCase()}</p>
                <p className="text-fs-14 text-mute">{o.createdAt.toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
              </div>
              <div className="text-right">
                <p className="text-fs-16 font-medium">{formatNaira(o.totalKobo)}</p>
                <p className="text-fs-14 capitalize text-mute">{o.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
