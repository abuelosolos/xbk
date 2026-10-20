export interface NavColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  columns: NavColumn[];
}

export const NAV: NavItem[] = [
  {
    key: "new",
    label: "New & Featured",
    href: "/shop",
    columns: [
      { title: "New & Featured", links: [{ label: "New Arrivals", href: "/shop" }, { label: "Best Sellers", href: "/shop?sort=featured" }, { label: "Member Exclusives", href: "/shop" }] },
      { title: "Shop by Price", links: [{ label: "Under ₦30,000", href: "/shop?price=u30" }, { label: "₦30,000 – ₦60,000", href: "/shop?price=30-60" }, { label: "Over ₦100,000", href: "/shop?price=o100" }] },
    ],
  },
  {
    key: "men",
    label: "Men",
    href: "/shop?gender=men",
    columns: [
      { title: "Footwear", links: [{ label: "All Footwear", href: "/shop?gender=men&category=footwear" }, { label: "Running", href: "/shop?gender=men&category=footwear" }, { label: "Lifestyle", href: "/shop?gender=men&category=footwear" }] },
      { title: "Clothing", links: [{ label: "All Clothing", href: "/shop?gender=men&category=clothing" }, { label: "Tops & T-Shirts", href: "/shop?gender=men&category=clothing" }, { label: "Shorts", href: "/shop?gender=men&category=clothing" }, { label: "Jackets", href: "/shop?gender=men&category=clothing" }] },
      { title: "Accessories", links: [{ label: "Bags & Backpacks", href: "/shop?gender=men&category=accessories" }, { label: "Socks", href: "/shop?gender=men&category=accessories" }] },
    ],
  },
  {
    key: "women",
    label: "Women",
    href: "/shop?gender=women",
    columns: [
      { title: "Footwear", links: [{ label: "All Footwear", href: "/shop?gender=women&category=footwear" }, { label: "Training", href: "/shop?gender=women&category=footwear" }] },
      { title: "Clothing", links: [{ label: "All Clothing", href: "/shop?gender=women&category=clothing" }, { label: "Leggings", href: "/shop?gender=women&category=clothing" }, { label: "Tanks & Tops", href: "/shop?gender=women&category=clothing" }] },
      { title: "Accessories", links: [{ label: "Bags & Backpacks", href: "/shop?gender=women&category=accessories" }, { label: "Socks", href: "/shop?gender=women&category=accessories" }] },
    ],
  },
  {
    key: "kids",
    label: "Kids",
    href: "/shop?gender=kids",
    columns: [{ title: "Kids", links: [{ label: "All Kids", href: "/shop?gender=kids" }, { label: "Footwear", href: "/shop?gender=kids&category=footwear" }] }],
  },
  {
    key: "sale",
    label: "Sale",
    href: "/shop?sale=1",
    columns: [{ title: "Sale", links: [{ label: "All Sale", href: "/shop?sale=1" }, { label: "Footwear Sale", href: "/shop?sale=1&category=footwear" }, { label: "Clothing Sale", href: "/shop?sale=1&category=clothing" }] }],
  },
];
