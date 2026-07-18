import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Proxy /api/* to the backend so cookies are first-party (same-origin).
  // This eliminates Chrome's third-party cookie blocking entirely.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      // Also proxy uploaded images so they load without CORS issues
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'https', hostname: '*.onrender.com' },
    ],
  },
};

export default nextConfig;
