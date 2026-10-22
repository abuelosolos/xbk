export interface NavColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  /** Photo for the mobile menu thumbnail (a file in public/, or an Unsplash id) */
  photo: string;
  columns: NavColumn[];
}

export const NAV: NavItem[] = [
  {
    key: "new",
    label: "New & Featured",
    href: "/shop",
    photo: "/xbk-court-sneaker-black.jpg",
    columns: [
      { title: "New & Featured", links: [{ label: "New Arrivals", href: "/shop" }, { label: "Best Sellers", href: "/shop?sort=featured" }, { label: "Member Exclusives", href: "/shop" }] },
      { title: "Shop by Price", links: [{ label: "Under ₦30,000", href: "/shop?price=u30" }, { label: "₦30,000 – ₦60,000", href: "/shop?price=30-60" }, { label: "Over ₦100,000", href: "/shop?price=o100" }] },
    ],
  },
  {
    key: "men",
    label: "Men",
    href: "/men",
    photo: "/xbk-knit-cardigan-olive.jpeg",
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
    photo: "/xbk-leather-bomber-black.jpg",
    columns: [
      { title: "Shoes", links: [{ label: "All Shoes", href: "/shop?gender=women&category=footwear" }, { label: "Training & Gym", href: "/shop?gender=women&category=footwear&type=training" }, { label: "Lifestyle", href: "/shop?gender=women&category=footwear&type=lifestyle" }] },
      { title: "Clothing", links: [{ label: "All Clothing", href: "/shop?gender=women&category=clothing" }, { label: "Leggings & Tights", href: "/shop?gender=women&category=clothing&type=leggings" }, { label: "Tops & Tanks", href: "/shop?gender=women&category=clothing&type=tops" }, { label: "Hoodies & Sweatshirts", href: "/shop?gender=women&category=clothing&type=hoodies" }] },
      { title: "Accessories", links: [{ label: "Bags & Backpacks", href: "/shop?gender=women&category=accessories&type=bags" }, { label: "Socks", href: "/shop?gender=women&category=accessories&type=socks" }] },
    ],
  },
  {
    key: "sale",
    label: "Sale",
    href: "/sale",
    photo: "/xbk-striped-cardigan-black-cream.jpeg",
    columns: [{ title: "Sale", links: [{ label: "All Sale", href: "/shop?sale=1" }, { label: "Shoes Sale", href: "/shop?sale=1&category=footwear" }, { label: "Clothing Sale", href: "/shop?sale=1&category=clothing" }, { label: "Accessories Sale", href: "/shop?sale=1&category=accessories" }] }],
  },
];
