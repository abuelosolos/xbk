export interface NavColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  /** Unsplash photo id for the mobile menu thumbnail */
  photo: string;
  columns: NavColumn[];
}

export const NAV: NavItem[] = [
  {
    key: "new",
    label: "New & Featured",
    href: "/shop",
    photo: "8GzbKs74yq4",
    columns: [
      { title: "New & Featured", links: [{ label: "New Arrivals", href: "/shop" }, { label: "Best Sellers", href: "/shop?sort=featured" }, { label: "Member Exclusives", href: "/shop" }] },
      { title: "Shop by Price", links: [{ label: "Under ₦30,000", href: "/shop?price=u30" }, { label: "₦30,000 – ₦60,000", href: "/shop?price=30-60" }, { label: "Over ₦100,000", href: "/shop?price=o100" }] },
    ],
  },
  {
    key: "men",
    label: "Men",
    href: "/men",
    photo: "_1BshZ602EM",
    columns: [
      { title: "Shoes", links: [{ label: "All Shoes", href: "/shop?gender=men&category=footwear" }, { label: "Running", href: "/shop?gender=men&category=footwear&type=running" }, { label: "Lifestyle", href: "/shop?gender=men&category=footwear&type=lifestyle" }] },
      { title: "Clothing", links: [{ label: "All Clothing", href: "/shop?gender=men&category=clothing" }, { label: "Tops & T-Shirts", href: "/shop?gender=men&category=clothing&type=tops" }, { label: "Hoodies & Sweatshirts", href: "/shop?gender=men&category=clothing&type=hoodies" }, { label: "Shorts", href: "/shop?gender=men&category=clothing&type=shorts" }, { label: "Jackets", href: "/shop?gender=men&category=clothing&type=jackets" }] },
      { title: "Accessories", links: [{ label: "Bags & Backpacks", href: "/shop?gender=men&category=accessories&type=bags" }, { label: "Socks", href: "/shop?gender=men&category=accessories&type=socks" }] },
    ],
  },
  {
    key: "women",
    label: "Women",
    href: "/women",
    photo: "d6gfjQmCL7E",
    columns: [
      { title: "Shoes", links: [{ label: "All Shoes", href: "/shop?gender=women&category=footwear" }, { label: "Training & Gym", href: "/shop?gender=women&category=footwear&type=training" }, { label: "Lifestyle", href: "/shop?gender=women&category=footwear&type=lifestyle" }] },
      { title: "Clothing", links: [{ label: "All Clothing", href: "/shop?gender=women&category=clothing" }, { label: "Leggings & Tights", href: "/shop?gender=women&category=clothing&type=leggings" }, { label: "Tops & Tanks", href: "/shop?gender=women&category=clothing&type=tops" }, { label: "Hoodies & Sweatshirts", href: "/shop?gender=women&category=clothing&type=hoodies" }] },
      { title: "Accessories", links: [{ label: "Bags & Backpacks", href: "/shop?gender=women&category=accessories&type=bags" }, { label: "Socks", href: "/shop?gender=women&category=accessories&type=socks" }] },
    ],
  },
  {
    key: "kids",
    label: "Kids",
    href: "/kids",
    photo: "vspPIvHpNO4",
    columns: [{ title: "Kids", links: [{ label: "All Kids", href: "/shop?gender=kids" }, { label: "Shoes", href: "/shop?gender=kids&category=footwear" }, { label: "Lifestyle Shoes", href: "/shop?gender=kids&category=footwear&type=lifestyle" }] }],
  },
  {
    key: "sale",
    label: "Sale",
    href: "/sale",
    photo: "B0s90BDX9xc",
    columns: [{ title: "Sale", links: [{ label: "All Sale", href: "/shop?sale=1" }, { label: "Shoes Sale", href: "/shop?sale=1&category=footwear" }, { label: "Clothing Sale", href: "/shop?sale=1&category=clothing" }, { label: "Accessories Sale", href: "/shop?sale=1&category=accessories" }] }],
  },
];
