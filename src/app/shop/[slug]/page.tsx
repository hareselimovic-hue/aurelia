// PROIZVODNA STRANICA — CLAUDE_aurelia.md §7 (skica), §3 (model proizvoda), §9 (schema),
// §10 (tehnički zahtjevi). Server component — jedini client dio je <DodajUKorpu> (./dodaj-u-korpu.tsx).
//
// Redoslijed blokova je propisan tačno u §7 i ponovljen u zadatku:
// Breadcrumb → Galerija (min 4 slike) → <h1> → cijena → izbor dimenzije → Dodaj u korpu →
// kratak opis → tabela specifikacija → duži opis → dostava i povrat → recenzije → slični proizvodi.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlaceholderImage } from "@/components/placeholder-image";
import { KarticaProizvoda } from "@/components/product/kartica-proizvoda";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  PLACEHOLDER_IMAGE,
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/products";
import { DodajUKorpu } from "./dodaj-u-korpu";

// TODO: prava domena čeka korisnika (CLAUDE_aurelia.md §1 — "DOMENA: ___.ba" još nepopunjeno).
// "aurelia.ba" je privremeni placeholder, usklađen s email domenom već korištenom u Footeru
// (info@aurelia.ba) — zamijeniti na jednom mjestu kad korisnik potvrdi finalnu domenu.
const SITE_URL = "https://aurelia.ba";

export function generateStaticParams() {
  return getAllProducts().map((proizvod) => ({ slug: proizvod.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const proizvod = getProductBySlug(slug);

  if (!proizvod) {
    return {};
  }

  // Kad tekst nedostaje (opisKratki je "" / TODO), ne izmišljati marketinški tekst — strukturna
  // fraza sastavljena iz stvarnih atributa (aurelia-frontend.md "Kad tekst nedostaje").
  const opis =
    proizvod.opisKratki.trim() ||
    `${proizvod.naziv} — ${proizvod.materijal}, ${proizvod.dimenzije.join(", ")}. Dostava po cijeloj BiH.`;
  const canonical = `${SITE_URL}/shop/${proizvod.slug}/`;

  return {
    title: `${proizvod.naziv} | Aurelia.ba`,
    description: opis,
    alternates: { canonical },
  };
}

export default async function ProizvodnaStranica({
  params,
}: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const proizvod = getProductBySlug(slug);

  if (!proizvod) {
    notFound();
  }

  // Galerija — min 4 slike. Trenutni podaci (src/lib/products.ts, generisiSlike) već garantuju
  // tačno 4 placeholder unosa po proizvodu, ali odbrana ostaje ovdje za slučaj da neki proizvod u
  // budućnosti ima manje od 4 stvarne fotografije.
  const galerija =
    proizvod.slike.length >= 4
      ? proizvod.slike.slice(0, Math.max(4, proizvod.slike.length))
      : [
          ...proizvod.slike,
          ...Array.from({ length: 4 - proizvod.slike.length }, () => ({
            url: PLACEHOLDER_IMAGE,
            alt: proizvod.naziv,
          })),
        ];

  // Slični proizvodi — 4 iz iste (primarne) kategorije, CLAUDE_aurelia.md §7.
  const kategorijaPrimarna = proizvod.kategorije[0];
  const slicniProizvodi = kategorijaPrimarna
    ? getProductsByCategory(kategorijaPrimarna)
        .filter((p) => p.slug !== proizvod.slug)
        .slice(0, 4)
    : [];

  const canonical = `${SITE_URL}/shop/${proizvod.slug}/`;

  // Specifikacije koje su već pokrivene baznim redovima tabele (materijal/dimenzije/pranje) se ne
  // ponavljaju iz proizvod.specifikacije — samo dodatne, jedinstvene činjenice (npr. "Set sadrži").
  const odrzavanje =
    proizvod.specifikacije.find((s) => /pranj/i.test(s.kljuc))?.vrijednost ??
    "Pranje prema deklaraciji na proizvodu";
  const dodatneSpecifikacije = proizvod.specifikacije.filter(
    (s) => !/materijal|dimenzij|pranj/i.test(s.kljuc)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: proizvod.naziv,
        sku: proizvod.slug,
        material: proizvod.materijal,
        color: proizvod.boja,
        description:
          proizvod.opisKratki.trim() || proizvod.opisDugi.trim() || proizvod.naziv,
        image: proizvod.slike
          .filter((s) => s.url !== PLACEHOLDER_IMAGE)
          .map((s) => `${SITE_URL}${s.url}`),
        offers: {
          "@type": "Offer",
          url: canonical,
          priceCurrency: "BAM",
          price: proizvod.cijena.toFixed(2),
          availability: proizvod.naStanju
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop/` },
          { "@type": "ListItem", position: 3, name: proizvod.naziv, item: canonical },
        ],
      },
      // Namjerno BEZ AggregateRating — nema stvarnih recenzija (CLAUDE_aurelia.md §9).
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* 01 — Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-primary">
                Početna
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop/" className="hover:text-primary">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground" aria-current="page">
              {proizvod.naziv}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* 02 — Galerija (min 4 slike, placeholder dok nemamo prave fotografije) */}
          <div className="grid grid-cols-2 gap-3">
            {galerija.map((slika, i) => (
              <div
                key={`${slika.url}-${i}`}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-lg bg-muted",
                  i === 0 && "col-span-2"
                )}
              >
                {slika.url === PLACEHOLDER_IMAGE ? (
                  <PlaceholderImage alt={slika.alt} />
                ) : (
                  // next/image zahtijeva poznat domain config; izvor pravih fotografija (CDN/CMS) još nije poznat.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slika.url}
                    alt={slika.alt}
                    loading={i === 0 ? undefined : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Info kolona: h1 → cijena → dimenzija/dodaj u korpu → kratak opis */}
          <div>
            {/* 03 — <h1> puni naziv (jedini h1 na stranici) */}
            <h1 className="font-heading text-3xl font-normal leading-[1.15] text-foreground md:text-4xl">
              {proizvod.naziv}
            </h1>

            {/* 04 — cijena */}
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-sans text-2xl font-semibold text-foreground">
                {formatPrice(proizvod.cijena)}
              </span>
              {proizvod.cijenaStara !== undefined && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(proizvod.cijenaStara)}
                </span>
              )}
            </p>

            {/* 05 + 06 — izbor dimenzije (ako ih ima više) + Dodaj u korpu */}
            <div className="mt-6">
              <DodajUKorpu proizvod={proizvod} />
            </div>

            {/* 07 — kratak opis (~50 riječi, opisKratki) */}
            <div className="mt-6 border-t border-border pt-6">
              {proizvod.opisKratki.trim() ? (
                <p className="text-base leading-relaxed text-foreground">
                  {proizvod.opisKratki}
                </p>
              ) : (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {/* TODO copy: aurelia-copywriter */}
                  Opis proizvoda je u pripremi. U međuvremenu pogledajte specifikacije ispod.
                </p>
              )}
            </div>

            {/* 08 — tabela specifikacija: materijal, dimenzije, boja, održavanje */}
            <div className="mt-8">
              <h2 className="font-heading text-xl font-medium text-foreground">
                Specifikacije
              </h2>
              <table className="mt-3 w-full border-collapse text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <th
                      scope="row"
                      className="w-1/3 py-2 pr-4 text-left font-medium text-muted-foreground"
                    >
                      Materijal
                    </th>
                    <td className="py-2 text-foreground">{proizvod.materijal}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <th
                      scope="row"
                      className="py-2 pr-4 text-left font-medium text-muted-foreground"
                    >
                      Dimenzije
                    </th>
                    <td className="py-2 text-foreground">{proizvod.dimenzije.join(" · ")}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <th
                      scope="row"
                      className="py-2 pr-4 text-left font-medium text-muted-foreground"
                    >
                      Boja
                    </th>
                    <td className="py-2 text-foreground">{proizvod.boja}</td>
                  </tr>
                  <tr className={cn(dodatneSpecifikacije.length > 0 && "border-b border-border")}>
                    <th
                      scope="row"
                      className="py-2 pr-4 text-left font-medium text-muted-foreground"
                    >
                      Održavanje
                    </th>
                    <td className="py-2 text-foreground">{odrzavanje}</td>
                  </tr>
                  {dodatneSpecifikacije.map((spec, i) => (
                    <tr
                      key={spec.kljuc}
                      className={cn(
                        i < dodatneSpecifikacije.length - 1 && "border-b border-border"
                      )}
                    >
                      <th
                        scope="row"
                        className="py-2 pr-4 text-left font-medium text-muted-foreground"
                      >
                        {spec.kljuc}
                      </th>
                      <td className="py-2 text-foreground">{spec.vrijednost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 09 — duži opis (150-250 riječi, opisDugi) */}
        <div className="mt-16 max-w-3xl">
          <h2 className="font-heading text-2xl font-normal text-foreground">O proizvodu</h2>
          {proizvod.opisDugi.trim() ? (
            <p className="mt-4 text-base leading-relaxed text-foreground">{proizvod.opisDugi}</p>
          ) : (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {/* TODO copy: aurelia-copywriter */}
              Detaljan opis ovog proizvoda je u pripremi.
            </p>
          )}
        </div>

        {/* 10 — dostava i povrat (kratke, već definisane trust poruke, ne treba copywriter) */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-normal text-foreground">Dostava i povrat</h2>
          <div className="mt-4 grid gap-6 rounded-xl border border-border bg-muted p-6 sm:grid-cols-3 md:p-8">
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground">Dostava</h3>
              <p className="mt-1 text-sm text-muted-foreground">Dostava po cijeloj BiH.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground">Plaćanje</h3>
              <p className="mt-1 text-sm text-muted-foreground">Plaćanje pouzećem.</p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground">Zamjena</h3>
              <p className="mt-1 text-sm text-muted-foreground">Zamjena u 14 dana.</p>
            </div>
          </div>
        </div>

        {/* 11 — recenzije (prazna komponenta, bez lažnih recenzija / AggregateRating) */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-normal text-foreground">Recenzije</h2>
          <p className="mt-3 text-sm text-muted-foreground">Uskoro prve recenzije.</p>
        </div>

        {/* 12 — slični proizvodi (4, ista kategorija) */}
        {slicniProizvodi.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-normal text-foreground">
              Slični proizvodi
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
              {slicniProizvodi.map((p) => (
                <KarticaProizvoda key={p.slug} proizvod={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
