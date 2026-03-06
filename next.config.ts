import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // static Next.js assets — cache-first, long TTL
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // images — cache-first
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image",
          expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // categories API — stale-while-revalidate (fast + fresh)
      {
        urlPattern: /\/api\/v1\/categories.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "categories-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // words list API (non-sample, used for full word table) — network-first
      {
        urlPattern: /\/api\/v1\/words.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "words-cache",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // HTML pages — network-first with cache fallback
      {
        urlPattern: /^https:\/\/impro-generator\.vercel\.app\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
})(nextConfig);
