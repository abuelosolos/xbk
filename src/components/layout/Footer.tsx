import Link from "next/link";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
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
          <Link href={href} className="text-fs-13 font-medium text-mute transition hover:text-ink lg:text-fs-14">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-white text-ink">
      {/* link columns and newsletter share one row on lg+; on tablet the newsletter sits above the columns */}
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 pb-10 pt-12 md:px-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:px-12 xl:gap-12">
        <NewsletterForm className="md:order-1 lg:order-2 lg:w-[260px] xl:w-[340px]" />

        {/* tablet & desktop link columns */}
        <div className="hidden gap-x-8 md:order-2 md:grid md:grid-cols-4 lg:order-1 lg:flex lg:gap-x-6 xl:gap-x-10">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-fs-12 font-medium text-mute lg:text-fs-13">{col.title}</h3>
              <LinkList links={col.links} className="space-y-2 lg:space-y-2.5" />
            </div>
          ))}
        </div>
      </div>

      {/* mobile: accordion per column */}
      <div className="px-4 md:hidden">
        {COLUMNS.map((col) => (
          <Disclosure key={col.title} title={col.title} bodyClassName="pb-6">
            <LinkList links={col.links} className="space-y-3" />
          </Disclosure>
        ))}
      </div>

      <div className="border-t border-hairline-soft md:mt-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 text-fs-12 font-medium text-mute md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8 md:py-5 lg:px-12">
          <span>© 2026 XBK. All Rights Reserved.</span>
          <ul className="flex flex-col gap-3 md:flex-row md:gap-5">
            {LEGAL.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
