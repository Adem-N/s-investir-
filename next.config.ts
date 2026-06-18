import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the bare /embed route to be displayed inside an <iframe> on the
  // S'investir WordPress site (and Vercel previews). The main app keeps the
  // browser default (same-origin framing only).
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sinvestir.fr https://*.sinvestir.fr https://*.vercel.app http://localhost:* ;",
          },
        ],
      },
    ];
  },
  images: {
    // CoinGecko serves coin logos from assets.coingecko.com / coin-images.coingecko.com
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
    ],
  },
};

export default nextConfig;
