export type Gender = "men" | "women" | "kids" | "unisex";

export interface Subcategory {
  slug: string;
  name: string;
  sortOrder?: number;
}

/** A shelf (Shoes, Clothing…) and its sub-categories, both already in display order. */
export interface Category {
  slug: string;
  name: string;
  sortOrder?: number;
  subcategories: Subcategory[];
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  /** category slug, e.g. "footwear" */
  category: string;
  /** sub-category slug inside that category, e.g. "running" */
  subcategory: string | null;
  gender: Gender;
  /** All money values are integer kobo (NGN minor units). */
  priceKobo: number;
  salePriceKobo: number | null;
  colors: ProductColor[];
  sizes: string[];
  badge: string | null;
  description: string;
  images: string[];
  /** Hidden from the storefront (admin and order history only). */
  archived?: boolean;
  stock: number;
}
