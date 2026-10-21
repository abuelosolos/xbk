import type { Metadata } from "next";
import { Bebas_Neue, Inter, Poppins } from "next/font/google";
import { BackToTop } from "@/components/layout/BackToTop";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: { default: "XBK", template: "%s | XBK" },
  description: "XBK — footwear, clothing and accessories built to move.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} ${poppins.variable}`}>
      <body className="min-h-dvh">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <BackToTop />
      </body>
    </html>
  );
}
