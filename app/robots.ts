import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://cardfellas.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/api/", "/checkout/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
