import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for development to prevent double rendering (reduces CPU usage)
  reactStrictMode: false,

  // Compress responses with gzip for faster loading
  compress: true,

  // Output as standalone for better production performance
  output: "standalone",

  // Configure experimental features for better performance
  experimental: {
    // Only optimize package imports — removes heavier experimental flags
    optimizePackageImports: ["@/lib/localData"],
  },

  // Disable powered-by header for cleaner responses
  poweredByHeader: false,
};

export default nextConfig;