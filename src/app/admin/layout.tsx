import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | XBK Admin" } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // authoritative role check (middleware only checks the cookie)
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pt-8 lg:grid-cols-[200px_1fr] lg:px-12">
      <aside>
        <p className="mb-3 px-4 text-fs-12 font-medium uppercase tracking-wide text-mute">Admin</p>
        <AdminNav />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
