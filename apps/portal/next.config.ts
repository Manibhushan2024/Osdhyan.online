import type { NextConfig } from "next";

// Parse storage hostname from env so image domains stay in sync automatically
function storageHostname(): string {
  const url =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const hostname = storageHostname();

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",

  // ── Image Domains ────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      ...(hostname
        ? [
            { protocol: "https" as const, hostname },
            { protocol: "http" as const, hostname },
          ]
        : []),
      // Google user avatars (OAuth)
      { protocol: "https" as const, hostname: "lh3.googleusercontent.com" },
      // Fallback: allow any https so fresh clones work without .env.local
      { protocol: "https" as const, hostname: "**" },
    ],
  },

  // ── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Block MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Enable XSS filter in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Control referrer information sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions — disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache public images for 30 days
        source: "/(.*)\\.(png|jpg|jpeg|gif|webp|svg|ico)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect bare /dashboard to /dashboard (canonical; avoids trailing-slash issues)
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
