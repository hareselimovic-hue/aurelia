// Kategorijska stranica "Peškiri" — CLAUDE_aurelia.md §5-obrazac primijenjen na jednu vrstu
// proizvoda umjesto na cijeli shop. Zamjenjuje raniji `/shop/?vrsta=peskiri` filter za SEO svrhe
// (vidi memoriju "project-aurelia-shop-kategorije"): vlastiti H1/title/uvod umjesto dijeljenog
// H1 "Posteljina — cijela ponuda" sa /shop/. `/shop/?vrsta=peskiri` i dalje radi kao filter (ne
// briše se), ali VrstaFilter pilula "Peškiri" sad linkuje ovdje (src/app/(prodavnica)/shop/
// filters.tsx).

import type { Metadata } from "next";
import Link from "next/link";

import { KarticaProizvoda } from "@/components/product/kartica-proizvoda";
import { getProductsByCategory } from "@/lib/products";
import { VrstaFilter } from "../filters";

const SITE_URL = "https://aurelia.ba";

const LINK = "font-medium text-primary underline-offset-4 hover:underline";

// Činjenična tabela (pravi <table>, kandidat za featured snippet) — dimenzije iz products.ts.
const TABELA_PESKIRA = [
  { artikal: "Peškir 140×70 cm", href: "/shop/peskir-140x70/", dimenzija: "140×70 cm", namjena: "Tijelo, poslije tuširanja ili kupanja" },
  { artikal: "Peškir 85×45 cm", href: "/shop/peskir-85x45/", dimenzija: "85×45 cm", namjena: "Lice i ruke, uz umivaonik" },
  { artikal: "Stopa za noge 50×70 cm", href: "/shop/stopa-za-noge/", dimenzija: "50×70 cm", namjena: "Pod ispred kade, tuša ili umivaonika" },
];

export const metadata: Metadata = {
  title: "Peškiri — 100% pamuk, sve veličine | Aurelia.ba",
  description:
    "Pamučni peškiri za kupatilo: veći za tijelo, manji za lice i ruke, i stopa za noge. Gusto tkanje, dobra upijenost. Dostava po BiH.",
  alternates: {
    canonical: `${SITE_URL}/shop/peskiri/`,
  },
};

export default function PeskiriPage() {
  const proizvodi = getProductsByCategory("peskiri");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop/` },
      { "@type": "ListItem", position: 3, name: "Peškiri", item: `${SITE_URL}/shop/peskiri/` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Peškiri",
    url: `${SITE_URL}/shop/peskiri/`,
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
              Peškiri
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 md:pb-12">
        <h1>Peškiri</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground">
          Peškiri od 100% pamuka u dvije veličine — veći za tijelo poslije tuširanja i manji za
          lice i ruke — plus stopa za noge za ispred kade ili tuš kabine. Gusto tkanje daje dobru
          upijenost i mekoću koja izdrži česta pranja, bez brzog habanja tkanine.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 md:pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <VrstaFilter current={{}} aktivnaVrsta="peskiri" />
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
            <p className="text-eyebrow text-primary">Veličine</p>
            <h2 className="mt-2">Koji peškir za šta</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Veći,{" "}
                <Link
                  href="/shop/peskir-140x70/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Peškir 140×70 cm
                </Link>
                , namijenjen je tijelu poslije tuširanja ili kupanja — dovoljno velik da se njime
                omota cijelo tijelo, uz gusto tkanje koje brzo upija vodu bez da ostane mokar
                dugo nakon upotrebe. Manji,{" "}
                <Link
                  href="/shop/peskir-85x45/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Peškir 85×45 cm
                </Link>
                , praktičniji je za svakodnevno pranje lica i ruku uz umivaonik — kompaktna
                veličina znači i brže sušenje između dvije upotrebe, što je važno kad u kupatilu
                visi više komada odjednom.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Uz peškire, u ponudi je i{" "}
                <Link
                  href="/shop/stopa-za-noge/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Stopa za noge 50×70 cm
                </Link>
                , od iste porodice pamučnog materijala — postavlja se ispred kade, tuš kabine ili
                umivaonika i rješava mokar, hladan pod odmah poslije tuširanja. Svi artikli su od
                100% pamuka i peru se na isti način kao i ostatak ponude: redovno pranje na
                umjerenoj temperaturi čuva mekoću i upijenost duže vrijeme.
              </p>
            </div>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Artikal
                    </th>
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Dimenzija
                    </th>
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Namjena
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABELA_PESKIRA.map((red) => (
                    <tr key={red.href} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium text-foreground">
                        <Link href={red.href} className={LINK}>
                          {red.artikal}
                        </Link>
                      </td>
                      <td className="p-3 text-muted-foreground">{red.dimenzija}</td>
                      <td className="p-3 text-muted-foreground">{red.namjena}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prošireni SEO tekst ispod grida (SEO audit 27.11.2026: kategorija ~280 → ~600 riječi). */}
          <div className="mt-8 rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Kvalitet</p>
            <h2 className="mt-2">Kako prepoznati dobar pamučni peškir</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Peškir od 100% pamuka upija vodu, umjesto da je samo razmazuje po koži. Mješavine s
                poliesterom znaju biti mekše na dodir u radnji, ali vlagu upijaju slabije.
              </p>
              <h3>Gustoća tkanja</h3>
              <p className="text-base leading-relaxed text-foreground">
                Kod gušće tkanog peškira na istoj površini ima više pamučnih petlji. Takav peškir je
                teži u ruci, bolje upija i duže zadržava oblik.
              </p>
              <h3>Mekši poslije prvih pranja</h3>
              <p className="text-base leading-relaxed text-foreground">
                Nov pamučni peškir na početku može upijati nešto slabije, jer vlakno još nosi
                ostatke iz proizvodnje. Nakon nekoliko pranja peškir postaje mekši i bolje upija.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Održavanje</p>
            <h2 className="mt-2">Pranje i održavanje peškira</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Nove peškire operite prije prve upotrebe, odvojeno od tamnog veša. Temperaturu
                pranja birajte prema deklaraciji na proizvodu i ne pretrpavajte mašinu, jer se
                peškiri tada slabije isperu i ostaju tvrdi.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Omekšivač koristite rijetko ili nikako. On ostavlja tanak sloj na vlaknima, pa
                peškir djeluje mekše, ali upija lošije. Za mekoću je dovoljno peškir dobro istresti
                prije sušenja. Sušenje na zraku produžava vijek tkanine, a ako koristite mašinu za
                sušenje, birajte nižu temperaturu.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Za izdavanje</p>
            <h2 className="mt-2">Peškiri za apartmane i izdavanje</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Gostu je po pravilu potreban jedan veliki i jedan mali peškir, a u kupatilu jedna
                stopa za noge. Da smjene gostiju ne bi čekale na pranje, dobro je imati i rezervne
                komplete: jedan je u upotrebi dok je drugi u pranju.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Ako opremate apartman od nule, jednostavnije je uzeti{" "}
                <Link href="/shop/puni-set-posteljine-single/" className={LINK}>
                  Puni set posteljine — Single krevet
                </Link>{" "}
                ili{" "}
                <Link href="/shop/puni-set-posteljine-bracni/" className={LINK}>
                  Puni set posteljine — bračni krevet
                </Link>
                . Oba seta sadrže po dva velika i dva mala peškira i stopu za noge, uz posteljinu, i
                15% su jeftiniji od pojedinačne kupovine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
