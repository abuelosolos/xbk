import { NextResponse } from "next/server";
import { applyFilters, EMPTY_FILTERS } from "@/lib/filters";
import { getAllProducts } from "@/lib/products";

// Lightweight product lookup for the navbar search overlay.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (!q) return NextResponse.json({ results: [], total: 0 });

  const matches = applyFilters(await getAllProducts(), { ...EMPTY_FILTERS, q }, "featured");
  return NextResponse.json({
    total: matches.length,
    results: matches.slice(0, 5).map((p) => ({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      image: p.images[0] ?? null,
      priceKobo: p.priceKobo,
      salePriceKobo: p.salePriceKobo,
    })),
  });
}
