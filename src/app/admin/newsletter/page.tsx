import { desc } from "drizzle-orm";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireAdmin("/admin/newsletter");
  const subs = hasDb() ? await getDb().select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(500) : [];
  const active = subs.filter((s) => !s.unsubscribedAt).length;

  return (
    <>
      <h1 className="mb-2 text-fs-32 font-medium leading-tight">Newsletter</h1>
      <p className="mb-8 text-fs-16 text-mute">{active} active subscriber{active === 1 ? "" : "s"}. The welcome email is edited under Emails.</p>

      <h2 className="mb-3 text-fs-20 font-medium">Send an email</h2>
      <BroadcastForm recipients={active} />

      <h2 className="mb-3 mt-12 text-fs-20 font-medium">Subscribers</h2>
      {subs.length === 0 ? (
        <p className="text-fs-16 text-mute">{hasDb() ? "No subscribers yet." : "Set DATABASE_URL to collect subscribers."}</p>
      ) : (
        <table className="w-full max-w-2xl text-left text-fs-14">
          <thead className="border-b border-hairline text-mute">
            <tr><th className="py-3 pr-4 font-medium">Email</th><th className="py-3 pr-4 font-medium">Joined</th><th className="py-3 font-medium">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="py-3 pr-4">{s.email}</td>
                <td className="py-3 pr-4">{s.createdAt.toLocaleDateString("en-NG")}</td>
                <td className="py-3">{s.unsubscribedAt ? "Unsubscribed" : "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
