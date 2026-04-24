import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osdhyan.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl,                                    lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${siteUrl}/dashboard/test-series`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${siteUrl}/dashboard/tests`,               lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${siteUrl}/dashboard/syllabus`,            lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${siteUrl}/dashboard/pyqs`,                lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${siteUrl}/dashboard/courses`,             lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${siteUrl}/dashboard/courses/ncert`,       lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${siteUrl}/dashboard/materials`,           lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${siteUrl}/dashboard/blogs`,               lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${siteUrl}/dashboard/focus`,               lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/auth/signup`,                   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/auth/login`,                    lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  return staticRoutes;
}
