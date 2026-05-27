import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://cardfellas.com";

const GAME_SLUGS = ["magic", "pokemon", "yugioh", "sports", "other"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/play`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = GAME_SLUGS.map((slug) => ({
    url: `${BASE}/shop/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...gameRoutes];
}
