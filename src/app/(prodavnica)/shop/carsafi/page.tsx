// Kategorijska stranica "Čaršafi" — CLAUDE_aurelia.md §5-obrazac primijenjen na jednu vrstu
// proizvoda umjesto na cijeli shop. Zamjenjuje raniji `/shop/?vrsta=carsafi` filter za SEO svrhe
// (vidi memoriju "project-aurelia-shop-kategorije"): vlastiti H1/title/uvod umjesto dijeljenog
// H1 "Posteljina — cijela ponuda" sa /shop/. `/shop/?vrsta=carsafi` i dalje radi kao filter (ne
// briše se), ali VrstaFilter pilula "Čaršafi" sad linkuje ovdje (src/app/(prodavnica)/shop/
// filters.tsx).

import type { Metadata } from "next";
import Link from "next/link";

import { KarticaProizvoda } from "@/components/product/kartica-proizvoda";
import { getProductsByCategory } from "@/lib/products";
import { VrstaFilter } from "../filters";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Čaršafi — 100% pamuk, ravni i na gumu | Aurelia.ba",
  description:
    "Pamučni čaršafi za Single i bračni krevet, 160×240 do 240×260 cm, ravni i na gumu. Gusto tkanje, izdržljivo na česta pranja. Dostava po BiH.",
  alternates: {
    canonical: `${SITE_URL}/shop/carsafi/`,
  },
};

export default function CarsafiPage() {
  const proizvodi = getProductsByCategory("carsafi");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop/` },
      { "@type": "ListItem", position: 3, name: "Čaršafi", item: `${SITE_URL}/shop/carsafi/` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Čaršafi",
    url: `${SITE_URL}/shop/carsafi/`,
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: proizvodi.map((proizvod, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/shop/${proizvod.slug}/`,
      name: proizvod.naziv,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary hover:underline">
                Početna
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/shop/" className="hover:text-primary hover:underline">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-foreground">
              Čaršafi
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 md:pb-12">
        <h1>Čaršafi</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground">
          Čaršafi od 100% pamuka za Single i bračni krevet, u ravnoj varijanti i na gumu s
          elastičnim rubom koji drži platno zategnutim preko noći. Dimenzije od 160×240 do
          240×260 cm pokrivaju standardne i veće, produžene dušeke.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 md:pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <VrstaFilter current={{}} aktivnaVrsta="carsafi" />
          <p className="text-sm text-muted-foreground">
            {proizvodi.length} {proizvodi.length === 1 ? "artikal" : "artikala"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
          {proizvodi.map((proizvod, indeks) => (
            <KarticaProizvoda key={proizvod.slug} proizvod={proizvod} prioritet={indeks < 8} />
          ))}
        </div>
      </div>

      <section className="border-t border-border bg-muted/40 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Ravni ili na gumu</p>
            <h2 className="mt-2">Koji čaršaf za koji krevet</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Za Single krevet s dušekom do oko 150 cm širine,{" "}
                <Link
                  href="/shop/carsaf-160x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf 160×240 cm
                </Link>{" "}
                je ravni kroj bez gume — prostire se preko dušeka sa dovoljno viška platna da se
                krajevi uvuku ispod. Za bračni krevet s dušekom do oko 200 cm širine, u ponudi je{" "}
                <Link
                  href="/shop/carsaf-220x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf 220×240 cm
                </Link>{" "}
                u istoj ravnoj varijanti, a za dušeke koji su duži ili širi od standardne bračne
                mjere postoji i veća,{" "}
                <Link
                  href="/shop/carsaf-240x260/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  produžena varijanta 240×260 cm
                </Link>
                .
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Ko ne želi da se čaršaf pomjera tokom noći, tu je{" "}
                <Link
                  href="/shop/carsaf-na-gumu-bracni-220x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf na gumu — bračni 220×240 cm
                </Link>
                : elastični rub oko cijelog oboda oblikovan je da obuhvati uglove dušeka i drži
                platno zategnutim, a namještanje i skidanje traje kraće nego kod ravnog čaršafa.
                Svi čaršafi u ponudi su od 100% pamuka i podnose česta pranja bez gubitka
                čvrstoće ili sjaja.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
