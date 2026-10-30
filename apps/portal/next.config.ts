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

// Backend origin for the same-origin proxy below (server-side only).
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000").replace(/\/$/, "");

// Video-room origins for live classes: public Jitsi, JaaS (8x8.vc) and an
// optional self-hosted Jitsi (NEXT_PUBLIC_JITSI_DOMAIN, same value as the
// backend's JITSI_DOMAIN).
const LIVE_VIDEO_ORIGINS = Array.from(
  new Set(
    ["meet.jit.si", "8x8.vc", (process.env.NEXT_PUBLIC_JITSI_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "")]
      .filter(Boolean)
      .map((d) => `"https://${d}"`),
  ),
).join(" ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",

  // ── Same-origin API proxy ─────────────────────────────────────────────────
  // With NEXT_PUBLIC_API_URL=/api the browser talks only to this host and
  // Next forwards to Laravel: one public URL (tunnel/CDN), no CORS, no
  // mixed-origin cookies. Set NEXT_PUBLIC_API_URL to an absolute URL to
  // bypass the proxy (e.g. Vercel → api.osdhyan.online directly).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` },
      { source: "/storage/:path*", destination: `${BACKEND_ORIGIN}/storage/:path*` },
      { source: "/up", destination: `${BACKEND_ORIGIN}/up` },
    ];
  },

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
          // Permissions — disable unnecessary browser features. Camera, mic and
          // screen share must also be delegable to the embedded live-class
          // video room (Jitsi / JaaS iframe), otherwise teachers cannot turn
          // their camera on inside the classroom page.
          {
            key: "Permissions-Policy",
            value: `camera=(self ${LIVE_VIDEO_ORIGINS}), microphone=(self ${LIVE_VIDEO_ORIGINS}), display-capture=(self ${LIVE_VIDEO_ORIGINS}), geolocation=(self), interest-cohort=()`,
          },
        ],
      },
      // Cache static assets aggressively — production only: production chunk
      // names carry a content hash, dev chunk names do not, so in dev this
      // header made browsers keep running stale code after every edit.
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
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
