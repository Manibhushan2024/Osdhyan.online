import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osdhyan.com";

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OSDHYAN — India's Smartest Exam Prep Platform",
    template: "%s | OSDHYAN",
  },
  description:
    "Crack BPSC, SSC, UPSC & more with OSDHYAN. Bilingual mock tests, AI-powered analytics, daily study planner, NCERT courses — all in one platform. Free to start.",
  keywords: [
    "BPSC mock test",
    "UPSC preparation",
    "SSC CGL practice",
    "online test series India",
    "exam preparation",
    "bilingual mock test",
    "BPSC AEDO",
    "previous year question papers",
    "free mock test",
    "AI study planner",
    "NCERT online",
    "competitive exam India",
  ],
  authors: [{ name: "OSDHYAN Team" }],
  creator: "OSDHYAN",
  publisher: "OSDHYAN",
  category: "education",

  // ── Open Graph (WhatsApp, Facebook, LinkedIn) ────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "OSDHYAN",
    title: "OSDHYAN — India's Smartest Exam Prep Platform",
    description:
      "Crack BPSC, SSC, UPSC & more with AI-powered mock tests, bilingual questions, and a built-in study planner. Free to start.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OSDHYAN — Exam Prep Platform",
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "OSDHYAN — India's Smartest Exam Prep Platform",
    description:
      "Crack BPSC, SSC, UPSC & more with AI mock tests and a smart study planner.",
    images: ["/og-image.png"],
    site: "@osdhyan",
    creator: "@osdhyan",
  },

  // ── Robots ───────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Canonical & alternate ────────────────────────────────────────────────
  alternates: {
    canonical: siteUrl,
  },

  // ── App / PWA ────────────────────────────────────────────────────────────
  applicationName: "OSDHYAN",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OSDHYAN",
  },

  // ── Verification (add search console token when available) ───────────────
  // verification: {
  //   google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "OSDHYAN",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description:
                "India's focused exam preparation platform for BPSC, SSC, UPSC and more.",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className={`${plusJakarta.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#1e293b",
                    color: "#fff",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "1rem",
                    fontWeight: 900,
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  },
                }}
              />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
