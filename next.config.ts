import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Demo photography comes from Unsplash (see lib/images.ts). Add your own
  // image host here once product photography is hosted (e.g. Cloudinary, R2).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unsplash.com", pathname: "/photos/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default config;
