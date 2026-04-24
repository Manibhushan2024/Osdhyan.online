import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osdhyan.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/dashboard/test-series", "/dashboard/tests", "/dashboard/courses", "/dashboard/materials", "/dashboard/blogs", "/dashboard/syllabus", "/dashboard/pyqs"],
        disallow: ["/admin", "/api", "/dashboard/identity", "/dashboard/settings", "/dashboard/focus", "/dashboard/productivity"],
      },
      {
        // Block AI scrapers that don't respect content licensing
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: ["/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
