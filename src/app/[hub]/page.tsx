import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/home/ProductRow";
import { HubHero } from "@/components/hub/HubHero";
import { HubTiles } from "@/components/hub/HubTiles";
import { Reveal } from "@/components/motion/Reveal";
import { HUBS, buildHub, findHub, shopHref } from "@/lib/collections";
import { getAllProducts } from "@/lib/products";

// Only the hubs in lib/collections exist; any other top-level slug 404s.
export const dynamicParams = false;
export const generateStaticParams = () => HUBS.map((h) => ({ hub: h.slug }));

type Params = Promise<{ hub: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const hub = findHub((await params).hub);
  return hub ? { title: hub.title, description: hub.blurb } : {};
}

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-[24px] font-medium uppercase leading-tight lg:text-[32px]">{children}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-[16px] font-medium underline underline-offset-4">
          Shop All
        </Link>
      )}
    </div>
  );
}

export default async function HubPage({ params }: { params: Params }) {
  const hub = findHub((await params).hub);
  if (!hub) notFound();

  const { products, sections } = buildHub(hub, await getAllProducts());
  const all = shopHref(hub.scope);
  // quick links: every section tile, flattened, minus duplicates
  const quick = [...new Map(sections.flatMap((s) => s.tiles).map((t) => [t.href, t])).values()];

  return (
    <>
      <HubHero title={hub.title} blurb={hub.blurb} photo={hub.photo} href={all} />

      <nav aria-label={`${hub.title} categories`} className="border-b border-hairline-soft">
        <ul className="scrollbar-none mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-4 lg:px-12">
          <li>
            <Link href={all} className="inline-flex h-10 items-center whitespace-nowrap rounded-pill bg-ink px-5 text-[14px] font-medium text-white transition hover:bg-charcoal">
              All {hub.title}
            </Link>
          </li>
          {quick.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="inline-flex h-10 items-center whitespace-nowrap rounded-pill border border-hairline px-5 text-[14px] font-medium transition hover:border-ink">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-[1440px] space-y-16 px-4 pt-12 lg:space-y-24 lg:px-12 lg:pt-16">
        {sections.map((s) => (
          <section key={s.title}>
            <Reveal><SectionHeading>{s.title}</SectionHeading></Reveal>
            <HubTiles section={s} />
          </section>
        ))}

        {products.length > 0 && (
          <section>
            <Reveal><SectionHeading href={all}>Trending in {hub.title}</SectionHeading></Reveal>
            <ProductRow products={products.slice(0, 4)} columns={4} />
          </section>
        )}
      </div>
    </>
  );
}
