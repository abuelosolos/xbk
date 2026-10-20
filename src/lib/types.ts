export type Gender = "men" | "women" | "kids" | "unisex";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  gender: Gender;
  /** All money values are integer kobo (NGN minor units). */
  priceKobo: number;
  salePriceKobo: number | null;
  colors: ProductColor[];
  sizes: string[];
  badge: string | null;
  description: string;
  images: string[];
  stock: number;
}
