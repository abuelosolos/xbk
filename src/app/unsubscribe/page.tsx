import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { Button } from "@/components/ui/Button";
import { validUnsubscribeToken } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Unsubscribe" };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string; done?: string }> }) {
  const { e = "", t = "", done } = await searchParams;
  const valid = e && t && validUnsubscribeToken(e, t);

  async function unsubscribe() {
    "use server";
    if (!valid || !hasDb()) return;
    await getDb().update(newsletterSubscribers).set({ unsubscribedAt: new Date() }).where(eq(newsletterSubscribers.email, e.toLowerCase()));
    const { redirect } = await import("next/navigation");
    redirect(`/unsubscribe?e=${encodeURIComponent(e)}&t=${t}&done=1`);
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-16">
      <h1 className="mb-4 text-fs-32 font-medium leading-tight">Unsubscribe</h1>
      {!valid ? (
        <p role="alert" className="text-fs-16 text-mute">This unsubscribe link isn&apos;t valid.</p>
      ) : done ? (
        <p role="status" className="text-fs-16 text-mute">You&apos;ve been unsubscribed. You won&apos;t get newsletter emails from us.</p>
      ) : (
        <form action={unsubscribe}>
          <p className="mb-6 text-fs-16 text-mute">Stop sending XBK newsletters to {e}?</p>
          <Button type="submit">Unsubscribe</Button>
        </form>
      )}
    </div>
  );
}
