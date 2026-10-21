import type { Category } from "@/lib/types";

/**
 * Standard shelves and sub-categories, in display order (array position becomes sort_order).
 * Used by `npm run db:seed` and as the storefront's taxonomy when DATABASE_URL is not set.
 * Migration 0001 inserts the same rows, so keep the two in step.
 */
export const CATEGORIES: Category[] = [
  {
    slug: "footwear",
    name: "Shoes",
    subcategories: [
      { slug: "running", name: "Running" },
      { slug: "training", name: "Training & Gym" },
      { slug: "lifestyle", name: "Lifestyle" },
    ],
  },
  {
    slug: "clothing",
    name: "Clothing",
    subcategories: [
      { slug: "tops", name: "Tops & T-Shirts" },
      { slug: "hoodies", name: "Hoodies & Sweatshirts" },
      { slug: "shorts", name: "Shorts" },
      { slug: "leggings", name: "Leggings & Tights" },
      { slug: "jackets", name: "Jackets & Outerwear" },
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    subcategories: [
      { slug: "bags", name: "Bags & Backpacks" },
      { slug: "socks", name: "Socks" },
    ],
  },
];
