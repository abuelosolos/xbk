import { desc } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

/** Quotes a cell and defuses spreadsheet formulas (=, +, -, @) in user-supplied addresses. */
const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;

export async function GET() {
  await requireAdmin("/admin/newsletter");
  const rows = hasDb() ? await getDb().select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)) : [];
  const lines = ["email,joined,status", ...rows.map((s) => [cell(s.email), s.createdAt.toISOString(), s.unsubscribedAt ? "unsubscribed" : "active"].join(","))];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="xbk-subscribers.csv"',
      "cache-control": "no-store",
    },
  });
}
