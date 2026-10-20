import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

const COLUMNS = [
  { title: "Shop", links: [["New & Featured", "/shop"], ["Men", "/shop?gender=men"], ["Women", "/shop?gender=women"], ["Kids", "/shop?gender=kids"], ["Sale", "/shop?sale=1"]] },
  { title: "Help", links: [["Order Status", "/account"], ["Shipping & Delivery", "/shop"], ["Returns", "/shop"], ["Contact Us", "/shop"]] },
  { title: "Company", links: [["About XBK", "/"], ["Careers", "/"], ["Sustainability", "/"]] },
  { title: "Account", links: [["Sign In", "/sign-in"], ["Join Us", "/sign-up"], ["Your Bag", "/cart"]] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-12">
        <div className="text-ink">
          <LogoMark className="w-14" />
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-[16px] font-medium">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[14px] font-medium text-mute transition hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline-soft">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[12px] font-medium text-mute lg:px-12">
          <span>© 2026 XBK. All Rights Reserved.</span>
          <span className="flex gap-5">
            <Link href="/" className="hover:text-ink">Terms of Sale</Link>
            <Link href="/" className="hover:text-ink">Privacy Policy</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
