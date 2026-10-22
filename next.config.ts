import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Kids section was removed; keep old links working.
  redirects: async () => [{ source: "/kids", destination: "/shop", permanent: true }],
  // Demo photography comes from Unsplash (lib/images.ts) and is loaded by
  // lib/image-loader.ts. When product photography moves to your own host
  // (e.g. Cloudinary, R2), add it here and extend the loader for it.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default config;
