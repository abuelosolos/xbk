import Image from "next/image";
import Link from "next/link";
import { CategoryRail } from "@/components/home/CategoryRail";
import { Hero } from "@/components/home/Hero";
import { ProductRow } from "@/components/home/ProductRow";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { unsplash } from "@/lib/images";
import { getAllProducts } from "@/lib/products";

// Admin actions revalidate on change; this is the backstop for anything they miss.
export const revalidate = 300;

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-fs-24 font-medium leading-tight">{children}</h2>
      {href && (
        <Link href={href} className="text-fs-16 font-medium underline underline-offset-4">
          Shop All
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const products = await getAllProducts();
  const trending = products.slice(0, 6);
  const clothing = products.filter((p) => p.category === "clothing").slice(0, 4);
  const stocked = products.filter((p) => p.stock > 0);
  const inSub = (category: string, sub: string) => stocked.some((p) => p.category === category && p.subcategory === sub);
  const outOfStock = [
    ...(stocked.some((p) => p.category === "footwear") ? [] : ["/footwear"]),
    ...(inSub("clothing", "jackets") ? [] : ["/shop?category=clothing&type=jackets"]),
    ...(stocked.some((p) => p.category === "accessories") ? [] : ["/accessories"]),
    ...(inSub("clothing", "hoodies") ? [] : ["/shop?category=clothing&type=hoodies"]),
    ...(stocked.some((p) => p.salePriceKobo !== null) ? [] : ["/sale"]),
  ];

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-[1440px] space-y-12 px-4 pt-12 lg:px-12">
        <Reveal>
          <section className="grid gap-2 md:grid-cols-2">
            {[
              { title: "Sneakers", sub: "Suede and leather courts on a gum sole.", href: "/shop?category=footwear&type=lifestyle", photo: "/xbk-court-sneaker-black.jpg" },
              { title: "Jackets", sub: "Bombers, puffers and layers that keep up.", href: "/shop?category=clothing&type=jackets", photo: "/xbk-puffer-jacket-off-white.jpg" },
            ].map((tile) => (
              <div key={tile.title} className="group relative isolate flex aspect-[4/3] items-end overflow-hidden bg-ink p-6 text-white lg:p-10">
                <Image
                  src={unsplash(tile.photo, 1400)}
                  alt=""
                  fill
                  sizes="(min-width:768px) 50vw, 100vw"
                  className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div>
                  <h3 className="display-campaign">{tile.title}</h3>
                  <p className="mt-2 text-fs-16 opacity-80">{tile.sub}</p>
                  <ButtonLink href={tile.href} variant="outline" className="mt-5">
                    Explore
                  </ButtonLink>
                </div>
              </div>
            ))}
          </section>
        </Reveal>

        <section>
          <Reveal><SectionHeading href="/shop">Trending Now</SectionHeading></Reveal>
          <ProductRow products={trending} />
        </section>

        <section>
          <Reveal><SectionHeading>Shop by Category</SectionHeading></Reveal>
          <CategoryRail outOfStock={outOfStock} />
        </section>

        {clothing.length > 0 && (
          <section>
            <Reveal><SectionHeading href="/clothing">Latest in Clothing</SectionHeading></Reveal>
            <ProductRow products={clothing} columns={4} />
          </section>
        )}
      </div>
    </>
  );
}
