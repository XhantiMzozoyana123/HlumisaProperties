import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for development to prevent double rendering (reduces CPU usage)
  reactStrictMode: false,

  // Compress responses with gzip for faster loading
  compress: true,

  // Configure experimental features for better performance
  experimental: {
    // Only optimize package imports — removes heavier experimental flags
    optimizePackageImports: ["@/lib/localData"],
  },
};

export default nextConfig;
