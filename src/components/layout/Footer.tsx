import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Disclosure } from "@/components/ui/Disclosure";

const COLUMNS = [
  { title: "Shop", links: [["New & Featured", "/shop"], ["Men", "/men"], ["Women", "/women"], ["Kids", "/kids"], ["Shoes", "/footwear"], ["Clothing", "/clothing"], ["Accessories", "/accessories"], ["Sale", "/sale"]] },
  { title: "Help", links: [["Order Status", "/account"], ["Shipping & Delivery", "/shop"], ["Returns", "/shop"], ["Contact Us", "/shop"]] },
  { title: "Company", links: [["About XBK", "/"], ["Careers", "/"], ["Sustainability", "/"]] },
  { title: "Account", links: [["Sign In", "/sign-in"], ["Join Us", "/sign-up"], ["Your Bag", "/cart"]] },
] as const;

const LEGAL = [["Terms of Sale", "/"], ["Terms of Use", "/"], ["Privacy Policy", "/"]] as const;

function LinkList({ links, className }: { links: (typeof COLUMNS)[number]["links"]; className?: string }) {
  return (
    <ul className={className}>
      {links.map(([label, href]) => (
        <li key={label}>
          <Link href={href} className="text-fs-14 font-medium text-mute transition hover:text-ink">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      {/* mobile: accordion per column */}
      <div className="px-4 pb-4 md:hidden">
        {COLUMNS.map((col) => (
          <Disclosure key={col.title} title={col.title} bodyClassName="pb-6">
            <LinkList links={col.links} className="space-y-3" />
          </Disclosure>
        ))}
        <p className="flex items-center gap-2 border-b border-hairline py-6 text-fs-14 font-medium text-mute">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
          </svg>
          Nigeria
        </p>
        <div className="space-y-4 py-6 text-fs-14 font-medium text-mute">
          <p>© 2026 XBK. All Rights Reserved.</p>
          <ul className="space-y-3">
            {LEGAL.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* tablet & desktop: columns */}
      <div className="hidden md:block">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-5 lg:px-12">
          <div className="text-ink">
            <LogoMark className="w-14" />
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-fs-16 font-medium">{col.title}</h3>
              <LinkList links={col.links} className="space-y-2" />
            </div>
          ))}
        </div>
        <div className="border-t border-hairline-soft">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-fs-12 font-medium text-mute lg:px-12">
            <span>© 2026 XBK. All Rights Reserved.</span>
            <span className="flex gap-5">
              {LEGAL.map(([label, href]) => (
                <Link key={label} href={href} className="hover:text-ink">{label}</Link>
              ))}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
