import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Add remote image hosts here once product photography is hosted (e.g. Cloudinary, R2).
  images: { remotePatterns: [] },
};

export default config;
