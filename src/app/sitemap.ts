import type { MetadataRoute } from "next";

import { getAllProducts } from "@/lib/products";

// CLAUDE_aurelia.md §10 (blokirajuće): "XML sitemap generisan". Next.js App Router konvencija —
// ova ruta se automatski servira na /sitemap.xml, bez ručnog pisanja XML-a.
//
// Namjerno izostavljeno: /korpa/ i /checkout/ (transakcione stranice, već nose noindex meta —
// vidi src/app/korpa/layout.tsx i src/app/checkout/layout.tsx) i /shop/ filtrirane varijante
// (kanonikal na tim URL-ovima uvijek pokazuje na čist /shop/, pa nemaju šta tražiti u sitemap-u).
const SITE_URL = "https://aurelia.ba";

// Statičan datum (NE Date.now()/new Date() bez argumenta — build mora biti determinističan).
// Ažurirati ručno kad se sadržaj sajta značajnije promijeni (novi proizvodi, redizajn).
const POSLJEDNJA_IZMJENA = new Date("2026-08-23");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticneRute = [
    "",
    "shop",
    "o-nama",
    "kontakt",
    "dostava-i-placanje",
    "reklamacije-i-povrat",
    "uslovi-koristenja",
    "politika-privatnosti",
  ].map((ruta) => ({
    url: ruta ? `${SITE_URL}/${ruta}/` : `${SITE_URL}/`,
    lastModified: POSLJEDNJA_IZMJENA,
    changeFrequency: "weekly" as const,
    priority: ruta === "" ? 1 : 0.7,
  }));

  const proizvodRute = getAllProducts().map((proizvod) => ({
    url: `${SITE_URL}/shop/${proizvod.slug}/`,
    lastModified: POSLJEDNJA_IZMJENA,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticneRute, ...proizvodRute];
}
