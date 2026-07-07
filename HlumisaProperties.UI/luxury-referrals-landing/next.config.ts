import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses with gzip for faster loading
  compress: true,

  // Output as standalone for better production performance
  output: "standalone",

  // Disable powered-by header
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
  },

  experimental: {
    optimizePackageImports: ["react"],
  },
};

export default nextConfig;