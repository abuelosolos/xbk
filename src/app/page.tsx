import Image from "next/image";
import Link from "next/link";
import { CategoryRail } from "@/components/home/CategoryRail";
import { Hero } from "@/components/home/Hero";
import { ProductRow } from "@/components/home/ProductRow";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { unsplash } from "@/lib/images";
import { getAllProducts } from "@/lib/products";

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-[32px] font-medium uppercase leading-tight">{children}</h2>
      {href && (
        <Link href={href} className="text-[16px] font-medium underline underline-offset-4">
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

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-[1440px] space-y-12 px-4 pt-12 lg:px-12">
        <section>
          <Reveal><SectionHeading href="/shop">Trending Now</SectionHeading></Reveal>
          <ProductRow products={trending} />
        </section>

        <Reveal>
          <section className="grid gap-2 md:grid-cols-2">
            {[
              { title: "Run", sub: "Road and trail, built light.", href: "/shop?category=footwear", photo: "Or4_-uT-S5c" },
              { title: "Train", sub: "Layers that keep up.", href: "/shop?category=clothing", photo: "1eJ9cG97BD8" },
            ].map((tile) => (
              <div key={tile.title} className="group relative isolate flex aspect-[4/3] items-end overflow-hidden bg-ink p-6 text-white lg:p-10">
                <Image
                  src={unsplash(tile.photo, 1400)}
                  alt=""
                  fill
                  sizes="(min-width:768px) 50vw, 100vw"
                  className="-z-10 object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div>
                  <h3 className="display-campaign">{tile.title}</h3>
                  <p className="mt-2 text-[16px] opacity-80">{tile.sub}</p>
                  <ButtonLink href={tile.href} variant="outline" className="mt-5">
                    Explore
                  </ButtonLink>
                </div>
              </div>
            ))}
          </section>
        </Reveal>

        <section>
          <Reveal><SectionHeading>Shop by Category</SectionHeading></Reveal>
          <CategoryRail />
        </section>

        {clothing.length > 0 && (
          <section>
            <Reveal><SectionHeading href="/shop?category=clothing">Latest in Clothing</SectionHeading></Reveal>
            <ProductRow products={clothing} columns={4} />
          </section>
        )}
      </div>
    </>
  );
}
