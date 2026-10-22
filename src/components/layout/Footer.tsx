import Link from "next/link";
import { InstagramLogo, TiktokLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Disclosure } from "@/components/ui/Disclosure";

const COLUMNS = [
  { title: "Shop", links: [["New & Featured", "/shop"], ["Men", "/men"], ["Women", "/women"], ["Shoes", "/footwear"], ["Clothing", "/clothing"], ["Accessories", "/accessories"], ["Sale", "/sale"]] },
  { title: "Help", links: [["Order Status", "/account"], ["Shipping & Delivery", "/shop"], ["Returns", "/shop"], ["Contact Us", "/shop"]] },
  { title: "Company", links: [["About XBK", "/"], ["Careers", "/"], ["Sustainability", "/"]] },
  { title: "Account", links: [["Sign In", "/sign-in"], ["Join Us", "/sign-up"], ["Your Bag", "/cart"]] },
] as const;

// TODO: replace the "#" placeholders with XBK's real profile / chat links
const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramLogo },
  { label: "TikTok", href: "#", Icon: TiktokLogo },
  { label: "WhatsApp", href: "#", Icon: WhatsappLogo },
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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-6 pt-10 md:px-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:px-12 xl:gap-12">
        <div className="hidden md:order-0 md:block lg:w-[220px] lg:shrink-0">
          <Link href="/" aria-label="XBK home" className="block w-16">
            <Logo className="w-full" />
          </Link>
          <p className="mt-3 max-w-[260px] text-fs-14 text-mute">Footwear, clothing and accessories in black and white.</p>
          <ul className="mt-4 flex gap-4">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="block text-ink transition hover:opacity-60">
                  <Icon size={24} weight="regular" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

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
          <Disclosure key={col.title} title={col.title} bodyClassName="pb-4">
            <LinkList links={col.links} className="space-y-2" />
          </Disclosure>
        ))}
        <Disclosure title="Terms of Service" bodyClassName="pb-4">
          <ul className="space-y-2">
            {LEGAL.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-fs-13 font-medium text-mute transition hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
        </Disclosure>
      </div>

      <div className="border-t border-hairline-soft md:mt-4">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 text-fs-12 font-medium text-mute md:flex-row md:flex-wrap md:items-center md:justify-between md:px-8 md:py-4 lg:px-12">
          <span>© 2026 XBK. All Rights Reserved.</span>
          <ul className="hidden md:flex md:gap-5">
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
