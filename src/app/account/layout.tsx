import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/account"); // authoritative check; middleware only sees the cookie
  return children;
}
