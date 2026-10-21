import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { addresses } from "@/db/schema";

export type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

/** A user's saved addresses, default first. Empty without a database. */
export async function listAddresses(userId: string): Promise<SavedAddress[]> {
  if (!hasDb()) return [];
  const rows = await getDb()
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
  return rows.map(({ userId: _u, createdAt: _c, ...a }) => a);
}

type NewAddress = Omit<SavedAddress, "id" | "isDefault">;

/** Saves an address and makes it the user's default; reuses an identical saved one instead of duplicating. */
export async function saveDefaultAddress(userId: string, a: NewAddress) {
  const db = getDb();
  const [same] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(
      and(
        eq(addresses.userId, userId),
        eq(addresses.fullName, a.fullName),
        eq(addresses.phone, a.phone),
        eq(addresses.address, a.address),
        eq(addresses.city, a.city),
        eq(addresses.state, a.state),
        eq(addresses.postalCode, a.postalCode),
      ),
    )
    .limit(1);
  // clear first: the partial unique index allows only one default per user
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  if (same) await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, same.id));
  else await db.insert(addresses).values({ ...a, userId, isDefault: true });
}
