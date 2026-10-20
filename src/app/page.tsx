import Link from "next/link";
import { CategoryRail } from "@/components/home/CategoryRail";
import { Hero } from "@/components/home/Hero";
import { ProductRow } from "@/components/home/ProductRow";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
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
              { title: "Run", sub: "Road and trail, built light.", href: "/shop?category=footwear", tone: "bg-ink text-white" },
              { title: "Train", sub: "Layers that keep up.", href: "/shop?category=clothing", tone: "bg-cloud text-ink" },
            ].map((tile) => (
              <div key={tile.title} className={`relative flex aspect-[4/3] items-end p-6 lg:p-10 ${tile.tone}`}>
                <div>
                  <h3 className="display-campaign">{tile.title}</h3>
                  <p className="mt-2 text-[16px] opacity-70">{tile.sub}</p>
                  <ButtonLink href={tile.href} variant={tile.tone.includes("bg-ink") ? "outline" : "primary"} className="mt-5">
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
