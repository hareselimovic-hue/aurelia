// POČETNA STRANICA — CLAUDE_aurelia.md §4 (obavezujuća specifikacija, blokovi tačnim redoslijedom
// 01-10 iz tog dokumenta; Header/Footer iz §01/§10 su već globalno u src/app/layout.tsx pa se ovdje
// ne ponavljaju). Vizuelna implementacija prati docs/design-system.md §4.3/4.4 za Hero i Trust
// traku. JEDINA namjerna izmjena naspram dokumenta je grid proizvoda (§4-05): grid-cols-1 na
// mobilnom umjesto 2 (dogovoreno s korisnikom, isto pravilo je već upisano kao komentar u
// KarticaProizvoda).

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Banknote, Leaf, RotateCcw, Truck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { KarticaProizvoda } from "@/components/product/kartica-proizvoda";
import { PlaceholderImage } from "@/components/placeholder-image";
import { getAllProducts } from "@/lib/products";

const SITE_URL = "https://aurelia.ba";

// Metadata — tačno iz CLAUDE_aurelia.md §4 (H1/Title/Meta tabela na vrhu sekcije).
export const metadata: Metadata = {
  title: "Posteljina — online prodaja posteljine | Aurelia.ba",
  description:
    "Kvalitetna posteljina za bračni i jednostruki krevet. Dostava po cijeloj BiH, plaćanje pouzećem, zamjena u 14 dana.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
};

// 03 — Kupuj po vrsti: 5 kartica na stvarne kategorije/materijale iz src/lib/products.ts
// (kategorije su već ASCII slugovi bez dijakritike, sigurne za URL query bez encodinga; materijal
// "pamučni damast" namjerno NIJE korišten kao filter vrijednost ovdje jer sadrži razmak i
// dijakritiku — vezuje se preko kategorije "damast" umjesto toga).
const KUPUJ_PO_VRSTI = [
  {
    naziv: "Posteljina od damasta",
    href: "/shop/?kategorija=damast",
    alt: "Posteljina od damasta",
  },
  {
    naziv: "Bračna posteljina",
    href: "/shop/?kategorija=bracna",
    alt: "Bračna posteljina",
  },
  {
    naziv: "100% pamučna posteljina",
    href: "/shop/?materijal=pamuk",
    alt: "100% pamučna posteljina",
  },
  {
    naziv: "Peškiri",
    href: "/shop/?kategorija=peskiri",
    alt: "Peškiri",
  },
  {
    naziv: "Čaršafi",
    href: "/shop/?kategorija=carsafi",
    alt: "Čaršafi",
  },
] as const;

// 08 — FAQ: teme tačno iz CLAUDE_aurelia.md §4-08. Pitanja su stvarna, odgovori su TODO placeholder
// (copy čeka aurelia-copywriter) — vidi napomenu na aurelia-frontend agentu "Kad tekst nedostaje".
const FAQ = [
  {
    pitanje: "Koje dimenzije posteljine su prave za bračni krevet?",
    odgovor: "Odgovor dolazi uskoro.",
  },
  {
    pitanje: "Koliki je rok dostave?",
    odgovor: "Odgovor dolazi uskoro.",
  },
  {
    pitanje: "Od kojeg materijala je izrađena posteljina?",
    odgovor: "Odgovor dolazi uskoro.",
  },
  {
    pitanje: "Mogu li zamijeniti veličinu ako mi ne odgovara?",
    odgovor: "Odgovor dolazi uskoro.",
  },
  {
    pitanje: "Koji su načini plaćanja?",
    odgovor: "Odgovor dolazi uskoro.",
  },
  {
    pitanje: "Da li se posteljina skuplja nakon pranja?",
    odgovor: "Odgovor dolazi uskoro.",
  },
] as const;

export default function Home() {
  const proizvodi = getAllProducts();

  // JSON-LD — CLAUDE_aurelia.md §9: Organization, WebSite+SearchAction, ItemList (svi proizvodi),
  // FAQPage. Bez AggregateRating (nema stvarnih ocjena, §9/§4-09/pravilo iz aurelia-frontend agenta).
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aurelia",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.svg`,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aurelia",
    url: `${SITE_URL}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: proizvodi.map((proizvod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/shop/${proizvod.slug}/`,
      name: proizvod.naziv,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((stavka) => ({
      "@type": "Question",
      name: stavka.pitanje,
      acceptedAnswer: {
        "@type": "Answer",
        text: stavka.odgovor,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 02 — Hero: statična slika, h1, podnaslov, jedno CTA dugme (docs/design-system.md §4.3).
          Tekst po CLAUDE_aurelia.md §4-02 (podnaslov mora sadržati "posteljina", "pamuk",
          "dostava BiH" — sadrži tačno). Ovo je LCP element stranice (§10): WebP, fetchPriority
          "high", BEZ loading="lazy". Foto: cottonbro studio / Pexels (pexels.com/@cottonbro,
          slobodna komercijalna licenca), izabrana jer topla jutarnja svjetlost odgovara paleti
          (docs/design-system.md — "toplo, svijetlo zlatno" umjesto doslovno zlatne boje). */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden rounded-b-2xl md:min-h-[80vh]">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero mora imati fetchPriority="high" bez next/image domain configa */}
        <img
          src="/images/hero/hero-cover.webp"
          alt="Topla, uredno namještena posteljina u sunčanoj spavaćoj sobi"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-transparent" />

        <div className="relative z-10 max-w-xl px-4 pb-12 sm:px-6 md:pb-20 lg:px-8">
          <h1 className="text-background">Posteljina</h1>
          <p className="mt-4 text-lg leading-relaxed text-background/90">
            100% pamučna posteljina za bračni i jednostruki krevet, s dostavom po cijeloj BiH.
          </p>
          <Link
            href="/shop/"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Pogledaj ponudu
          </Link>
        </div>
      </section>

      {/* 03 — Trust traka: 4 stavke, pravi HTML tekst (docs/design-system.md §4.4). */}
      <section className="border-y border-border bg-muted">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4 md:divide-x md:divide-border lg:px-8">
          <div className="flex items-center gap-3 md:justify-center md:px-4">
            <Truck className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Dostava po cijeloj BiH</span>
          </div>
          <div className="flex items-center gap-3 md:justify-center md:px-4">
            <Banknote className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Plaćanje pouzećem</span>
          </div>
          <div className="flex items-center gap-3 md:justify-center md:px-4">
            <RotateCcw className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Zamjena u 14 dana</span>
          </div>
          <div className="flex items-center gap-3 md:justify-center md:px-4">
            <Leaf className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">100% pamuk</span>
          </div>
        </div>
      </section>

      {/* 04 — Kupuj po vrsti: kartice na stvarne kategorije, anchor tekst = keyword fraza. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Kupuj po vrsti</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
          {KUPUJ_PO_VRSTI.map((stavka) => (
            <Link
              key={stavka.href}
              href={stavka.href}
              className="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border transition-shadow hover:shadow-md hover:ring-primary/30"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <PlaceholderImage alt={stavka.alt} />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="text-sm font-medium text-foreground group-hover:text-primary">
                  {stavka.naziv}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 05 — Svih 8 proizvoda (faza 1 ima 8/15, vidi napomenu na vrhu src/lib/products.ts) — svi
          renderovani direktno u HTML-u, bez "učitaj još" i bez client-fetcha. Grid grid-cols-1
          md:grid-cols-4 je namjerno odstupanje od CLAUDE_aurelia.md, vidi komentar na vrhu ovog
          fajla i u kartica-proizvoda.tsx. Svih 8 slika bez lazy-load (prioritet=true). */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Naša posteljina</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
          {proizvodi.map((proizvod) => (
            <KarticaProizvoda key={proizvod.slug} proizvod={proizvod} prioritet />
          ))}
        </div>
      </section>

      {/* 06 — Zašto kod nas: struktura po CLAUDE_aurelia.md §4-06 (rok i cijena dostave, postupak
          zamjene, ko stoji iza shopa), copy je TODO dok aurelia-copywriter ne isporuči finalni tekst. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Zašto kod nas</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <h3>Rok i cijena dostave</h3>
            {/* TODO copy: aurelia-copywriter */}
            <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>
          </div>
          <div>
            <h3>Postupak zamjene</h3>
            {/* TODO copy: aurelia-copywriter */}
            <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>
          </div>
          <div>
            <h3>Ko stoji iza shopa</h3>
            {/* TODO copy: aurelia-copywriter */}
            <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>
          </div>
        </div>
      </section>

      {/* 07 — SEO tekst (400-600 riječi, CLAUDE_aurelia.md §4-07): struktura h2 + 3 h3 je postavljena,
          finalni copy je TODO dok aurelia-copywriter ne napiše tekst (uputa iz aurelia-frontend
          agenta: ne izmišljati finalni marketinški/SEO ton sam). */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-3xl">
          <h2>Kako odabrati posteljinu</h2>
          {/* TODO copy: aurelia-copywriter — uvodni pasus (400-600 riječi ukupno u bloku) */}
          <p className="mt-4 text-muted-foreground">Tekst dolazi.</p>

          <h3 className="mt-8">Materijali — pamuk, ranforce, saten</h3>
          {/* TODO copy: aurelia-copywriter */}
          <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>

          <h3 className="mt-8">Dimenzije — 140x200, 160x200, 200x200</h3>
          {/* TODO copy: aurelia-copywriter */}
          <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>

          <h3 className="mt-8">Održavanje i pranje</h3>
          {/* TODO copy: aurelia-copywriter */}
          <p className="mt-2 text-muted-foreground">Tekst dolazi.</p>
        </div>
      </section>

      {/* 08 — FAQ: pitanja su stvarna (CLAUDE_aurelia.md §4-08), odgovori TODO dok copywriter ne
          isporuči finalni tekst. keepMounted drži odgovore u DOM-u i kad je panel zatvoren — CSS
          sakrivanje (visina preko --accordion-panel-height u src/components/ui/accordion.tsx), NE
          JS injection na klik (blokirajuće pravilo). */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Česta pitanja</h2>
        <Accordion keepMounted className="mt-8 max-w-3xl">
          {FAQ.map((stavka, index) => (
            <AccordionItem key={stavka.pitanje} value={index}>
              <AccordionTrigger>
                <h3>{stavka.pitanje}</h3>
              </AccordionTrigger>
              <AccordionContent>
                {/* TODO copy: aurelia-copywriter */}
                <p className="text-muted-foreground">{stavka.odgovor}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 09 — Recenzije: prazna komponenta do prvih narudžbi, bez lažnih recenzija, bez
          AggregateRating schema (CLAUDE_aurelia.md §4-09, §9). */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Recenzije</h2>
        <p className="mt-4 text-muted-foreground">Uskoro prve recenzije kupaca.</p>
      </section>
    </>
  );
}
