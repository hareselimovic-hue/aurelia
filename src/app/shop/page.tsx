// SHOP stranica — CLAUDE_aurelia.md §5. Redoslijed blokova je namjerno identičan §5 (01-06):
// Breadcrumb -> Naslov/uvod -> Filteri+sortiranje -> Grid -> SEO tekst -> Footer (Footer je već
// u layout.tsx, ne renderuje se ovdje). §5-03 (filteri/sortiranje/canonical/noindex) je označen
// kao tehnički najosjetljiviji dio projekta — implementacija te logike živi u ./shop-filters.ts
// (čisto, dijeli je i generateMetadata i render) i ./filters.tsx (UI, sidebar + mobilni drawer).
//
// searchParams je Promise u ovoj Next.js verziji (16.3.2, vidi node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/page.md) — mora se await-ovati, ne čitati sinhrono.

import type { Metadata } from "next";
import Link from "next/link";

import { KarticaProizvoda } from "@/components/product/kartica-proizvoda";
import { getAllProducts } from "@/lib/products";
import { VrstaFilter } from "./filters";
import {
  filtrirajProizvode,
  izracunajRobots,
  normalizeSearchParams,
  sortirajProizvode,
  type RawSearchParams,
} from "./shop-filters";

// Domen naveden eksplicitno u zadatku za canonical/schema. CLAUDE_aurelia.md §1 "Popuni prije
// početka" još uvijek ima [Brend].ba kao nepotvrđen placeholder — ažurirati ovdje ako se domen
// promijeni prije lansiranja.
const SITE_URL = "https://aurelia.ba";

type ShopPageProps = {
  searchParams: Promise<RawSearchParams>;
};

// Stvarne dimenzije iz src/lib/products.ts (svih 8 proizvoda, provjereno ručno), mapirane na
// preporuku za krevet/upotrebu — ta preporuka ne postoji u modelu podataka pa se ne može izvesti
// automatski, zato je ovo ručna, ali činjenična tabela (ne marketinški tekst), CLAUDE_aurelia.md
// §5-05: "dobar kandidat za featured snippet, mora biti pravi <table>". Sortirano rastuće po
// prvoj brojci dimenzije.
const TABELA_DIMENZIJA: { dimenzija: string; vrsta: string; odgovaraZa: string }[] = [
  { dimenzija: "50×70 cm", vrsta: "Jastučnica", odgovaraZa: "Standardni jastuk" },
  { dimenzija: "85×45 cm", vrsta: "Peškir (ručni)", odgovaraZa: "Umivaonik, ruke" },
  { dimenzija: "140×70 cm", vrsta: "Peškir (za tijelo)", odgovaraZa: "Kupatilo, poslije tuširanja" },
  {
    dimenzija: "140×200 cm",
    vrsta: "Posteljina (Slifer, uska linija)",
    odgovaraZa: "Single krevet",
  },
  {
    dimenzija: "160×240 cm",
    vrsta: "Čaršaf",
    odgovaraZa: "Single krevet (dušek do ~150 cm širine)",
  },
  {
    dimenzija: "200×200 cm",
    vrsta: "Posteljina (Slifer, bračna linija)",
    odgovaraZa: "Bračni krevet",
  },
  {
    dimenzija: "220×240 cm",
    vrsta: "Čaršaf / čaršaf na gumu",
    odgovaraZa: "Bračni krevet (dušek do ~200 cm širine)",
  },
  {
    dimenzija: "240×290 cm",
    vrsta: "Čaršaf",
    odgovaraZa: "Bračni krevet, veća/produžena varijanta",
  },
];

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = normalizeSearchParams(await searchParams);
  const robots = izracunajRobots(params);

  return {
    title: "Posteljina — svi modeli i dimenzije | Aurelia.ba",
    // Prilagođeno stvarnom asortimanu (products.ts): damast posteljina, peškiri, čaršafi — NE
    // ranforce/saten kako je pisalo u CLAUDE_aurelia.md §5 primjeru (ta linija još nije u ponudi).
    description:
      "Pregledaj cijelu ponudu: posteljina od pamučnog damasta, peškiri i čaršafi od 100% pamuka. Dimenzije od 85×45 do 240×290 cm. Dostava po BiH.",
    alternates: {
      // §5-03, blokirajuće pravilo: canonical UVIJEK pokazuje na čisti /shop/, bez obzira na
      // aktivne filtere ili sortiranje.
      canonical: `${SITE_URL}/shop/`,
    },
    robots,
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = normalizeSearchParams(await searchParams);
  const sviProizvodi = getAllProducts();
  const filtrirani = filtrirajProizvode(sviProizvodi, params);
  const prikazani = sortirajProizvode(filtrirani, params.sort);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop/` },
    ],
  };

  return (
    <>
      {/* 01 — Breadcrumb (§5-01): "Početna › Shop" + BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
            <li aria-current="page" className="font-medium text-foreground">
              Shop
            </li>
          </ol>
        </nav>
      </div>

      {/* 02 — Naslov i uvod (§5-02): <h1> + 60-100 riječi. Korisnik 23.08.2026: ne navoditi broj
          artikala ni raspon cijena (brzo zastari, mijenja se sa svakim novim proizvodom/setom) —
          fokus na kvalitetu, izdržljivost i premium poziciju za apartmane/hotele/privatnu upotrebu. */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 md:pb-12">
        <h1>Posteljina — cijela ponuda</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground">
          Svaki komad u Aurelia ponudi biramo prije svega po kvalitetu materijala i izdržljivosti —
          posteljina, peškiri i čaršafi izrađeni su da izdrže svakodnevno pranje i korištenje bez
          gubitka mekoće i sjaja. To nas čini pouzdanim izborom kako za privatna domaćinstva, tako i
          za apartmane i hotele kojima je stalna kvaliteta ključna za goste. Ispod možete filtrirati
          ponudu po vrsti proizvoda.
        </p>
      </div>

      {/* 03 — Filter (§5-03) pojednostavljen 23.08.2026 (korisnički feedback: "za ovako mali broj
          proizvoda filter je suvišan... ostavi samo Posteljine, Peskiri, Čaršafi/Gume"). Puni
          sidebar (materijal/dimenzija/boja/cijena) + sortiranje su uklonjeni iz vidljivog UI-a —
          jedini vidljivi filter je "vrsta", prikazan kao red pill dugmadi iznad grida umjesto
          sidebar-a s naslovom "Filteri"/"Očisti sve". Logika za ostale filtere i sortiranje ostaje
          netaknuta u ./shop-filters.ts i ./filters.tsx (FiltersDesktop/FiltersMobile/SortLinks) —
          i dalje ispravno radi ako neko ručno doda ?materijal=/?sort= u URL, samo više nema
          kontrole za to u UI-u. Canonical (uvijek /shop/) i noindex za 2+ filtera/sort su netaknuti
          u shop-filters.ts — sad se kroz UI nikad ne mogu okinuti jer postoji samo 1 vidljivi
          filter, što je namjerno u skladu sa zadatkom. + 04 — Grid (§5-04). */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 md:pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <VrstaFilter current={params} />
          <p className="text-sm text-muted-foreground">
            {prikazani.length} {prikazani.length === 1 ? "artikal" : "artikala"}
          </p>
        </div>

        {prikazani.length > 0 ? (
          // Grid: grid-cols-1 md:grid-cols-4 (dogovorena izmjena od 2 mobilne kolone iz
          // CLAUDE_aurelia.md §5-04 — vidi napomenu u kartica-proizvoda.tsx).
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
            {prikazani.map((proizvod, indeks) => (
              <KarticaProizvoda key={proizvod.slug} proizvod={proizvod} prioritet={indeks < 8} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Nema proizvoda za odabranu vrstu.{" "}
            <Link
              href="/shop/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Ukloni filter
            </Link>
            .
          </p>
        )}
      </div>

      {/* 05 — SEO tekst (§5-05), mora biti drugačiji od početne. Tekst je NETAKNUT — jedina izmjena
          23.08.2026 (korisnički feedback: "ove sekcije ispod... si samo nabacao, nema strukture,
          stoje onako napisane na sredini bez ikakvog smisla") je vizuelni tretman: svaki blok
          ("Šta se nalazi u ponudi" i "Tabela dimenzija") sad je zasebna kartica (bg-card, ring-1
          ring-border, radius) sa eyebrow labelom iznad h2, umjesto dvije gomile teksta poređane
          jedna ispod druge u istoj traci bez granice. */}
      <section className="border-t border-border bg-muted/40 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Asortiman</p>
            <h2 className="mt-2">Šta se nalazi u ponudi</h2>
            <div className="mt-4 max-w-3xl space-y-4">
              <p className="text-base leading-relaxed text-foreground">
                Asortiman je namjerno uzak umjesto razvučen: pamučni damast za posteljinu, plus
                čaršafi i peškiri od 100% pamuka za sve što ide uz nju. Nema ranforce ni saten
                varijanti — fokus je na dvije provjerene vrste tkanja umjesto na dugačku listu
                materijala koje je teško međusobno uporediti.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Posteljina od damasta dolazi u dvije linije: uža,{" "}
                <Link
                  href="/shop/posteljina-od-damasta-uska-linija/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Posteljina od damasta — uska linija (Slifer + 1 jastučnica)
                </Link>{" "}
                za Single krevet, i bračna,{" "}
                <Link
                  href="/shop/posteljina-od-damasta-bracna/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Posteljina od damasta — bračna (Slifer + 2 jastučnice)
                </Link>
                , sa dvije jastučnice za dvoje. Obje imaju žakardno tkanje sa suptilnim uzorkom i
                blagim prirodnim sjajem, umjesto glatke, jednolične površine.
              </p>
              <p className="text-base leading-relaxed text-foreground">
                Čaršafi pokrivaju raspon od užeg Single dušeka (
                <Link
                  href="/shop/carsaf-160x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf 160×240 cm
                </Link>
                ) do velikog bračnog dušeka (
                <Link
                  href="/shop/carsaf-220x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf 220×240 cm
                </Link>
                ), uključujući i čaršaf na gumu za one koji ne žele da im se čaršaf pomjera tokom
                noći (
                <Link
                  href="/shop/carsaf-na-gumu-bracni-220x240/"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Čaršaf na gumu — bračni 220×240 cm
                </Link>
                ). Peškire nudimo u dvije veličine — manji za lice i ruke, veći za tijelo poslije
                tuširanja — oba od gustog, upijajućeg pamuka. Ispod je tabela koja povezuje svaku
                dimenziju iz ponude sa krevetom ili upotrebom za koju je namijenjena.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-card p-6 ring-1 ring-border sm:p-8">
            <p className="text-eyebrow text-primary">Vodič kroz dimenzije</p>
            <h2 className="mt-2">Tabela dimenzija — koja veličina za koji krevet</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground">
              Tabela ispod prikazuje dimenzije dostupne u trenutnoj ponudi i uz koji tip kreveta ili
              upotrebu obično odgovaraju.
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Dimenzija
                    </th>
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Vrsta proizvoda
                    </th>
                    <th scope="col" className="p-3 font-medium text-foreground">
                      Odgovara za
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TABELA_DIMENZIJA.map((red) => (
                    <tr key={red.dimenzija} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium text-foreground">{red.dimenzija}</td>
                      <td className="p-3 text-muted-foreground">{red.vrsta}</td>
                      <td className="p-3 text-muted-foreground">{red.odgovaraZa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Footer (§5-06): dijeljena komponenta, već u src/app/layout.tsx */}
    </>
  );
}
