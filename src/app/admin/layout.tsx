import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | XBK Admin" } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // authoritative role check (middleware only checks the cookie)
  return (
    <div className="min-h-dvh bg-cloud pb-24 md:pb-16">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pt-4 md:grid-cols-[168px_minmax(0,1fr)] md:gap-8 md:px-8 md:pt-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-12">
        <aside className="hidden md:sticky md:top-6 md:block md:self-start">
          <p className="mb-3 px-4 text-fs-12 font-medium uppercase tracking-wide text-mute">Admin</p>
          <AdminNav />
        </aside>
        <section className="min-w-0 max-w-[1080px]">{children}</section>
      </div>
      <AdminTabBar />
    </div>
  );
}
