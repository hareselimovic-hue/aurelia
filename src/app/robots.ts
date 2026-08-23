import type { MetadataRoute } from "next";

// CLAUDE_aurelia.md §10 (blokirajuće): "robots.txt postavljen". App Router konvencija — servira se
// automatski na /robots.txt. Korpa i checkout su transakcione stranice (već nose noindex meta, vidi
// src/app/korpa/layout.tsx i src/app/checkout/layout.tsx) — disallow ovdje je dodatna, eksplicitna
// zaštita da ih crawleri i ne pokušavaju indeksirati.
const SITE_URL = "https://aurelia.ba";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/korpa/", "/checkout/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
