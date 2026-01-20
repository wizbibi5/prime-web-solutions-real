import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable source maps for Designer Mode correlation
  productionBrowserSourceMaps: false,

  // Absolutely lenient configuration - never fail builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Moved from experimental in Next.js 15+
  outputFileTracingRoot: process.cwd(),

  // Simple image configuration
  images: {
    unoptimized: false,
  },

  // Basic performance settings
  poweredByHeader: false,


  devIndicators:false,
  // Flexible iframe embedding
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
