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

// 03 — Kupuj po vrsti: 3 kartice po glavnim vrstama proizvoda (korisnik, 22.08.2026 — pojednostavljeno
// sa 5 na 3 kartice po tipu proizvoda umjesto tipa/materijala). Kategorije su ASCII slugovi bez
// dijakritike, sigurne za URL query bez encodinga. Slike su stvarne fotografije proizvoda.
const KUPUJ_PO_VRSTI = [
  {
    naziv: "Posteljine",
    href: "/shop/?vrsta=posteljina",
    alt: "Posteljina od pamučnog damasta",
    slika: "/images/products/damast-bracna-1.webp",
  },
  {
    naziv: "Peškiri",
    href: "/shop/?vrsta=peskiri",
    alt: "Pamučni peškiri",
    slika: "/images/products/peskir-140x70-1.webp",
  },
  {
    naziv: "Čaršafi i gume",
    href: "/shop/?vrsta=carsafi",
    alt: "Čaršafi i čaršafi na gumu",
    slika: "/images/products/carsaf-na-gumu-1.webp",
  },
] as const;

// 08 — FAQ: teme tačno iz CLAUDE_aurelia.md §4-08. Pitanja su stvarna, odgovori su TODO placeholder
// (copy čeka aurelia-copywriter) — vidi napomenu na aurelia-frontend agentu "Kad tekst nedostaje".
const FAQ = [
  {
    pitanje: "Koje dimenzije posteljine su prave za bračni krevet?",
    odgovor:
      "Za bračni krevet uzmite set sa Sliferom (navlakom za poplun) 200×200 cm i dvije jastučnice 50×70 cm — to je bračna linija naše posteljine od damasta. Ako birate i čaršaf, uz nju ide dimenzija 220×240 cm za dušek do oko 200 cm širine, a za veći ili produženi dušek 240×290 cm.",
  },
  {
    pitanje: "Koliki je rok dostave?",
    odgovor:
      "Šaljemo kurirskom službom na adresu širom Bosne i Hercegovine. Tačan rok isporuke i trošak dostave vidite prije potvrde narudžbe, kad unesete adresu — obično je riječ o svega nekoliko radnih dana od potvrde.",
  },
  {
    pitanje: "Od kojeg materijala je izrađena posteljina?",
    odgovor:
      "Posteljina je izrađena od 100% pamučnog damasta — žakardnog tkanja sa suptilnim utkanim uzorkom i blagim prirodnim sjajem. Čaršafi i peškiri su od 100% pamuka. Nigdje u ponudi nema sintetičkih primjesa poput mikrofibera ili poliestera.",
  },
  {
    pitanje: "Mogu li zamijeniti veličinu ako mi ne odgovara?",
    odgovor:
      "Da, u roku od 14 dana od prijema. Javite nam se telefonom ili preko Vibera, dogovorimo zamjenu za drugu dimenziju ili proizvod — artikal treba biti nekorišten i u originalnom pakovanju.",
  },
  {
    pitanje: "Koji su načini plaćanja?",
    odgovor:
      "Trenutno je dostupno plaćanje pouzećem (gotovinom kuriru pri preuzimanju) i uplatom na bankovni račun prije slanja. Plaćanje karticom putem pay-by-link linka je u pripremi i biće dostupno uskoro, čim se checkout stranica u potpunosti dovrši.",
  },
  {
    pitanje: "Da li se posteljina skuplja nakon pranja?",
    odgovor:
      "Pri pranju na preporučenoj temperaturi (40-60°C) skupljanje je minimalno, jer je pamučno vlakno prije šivanja obrađeno da zadrži dimenzije. Pranje na maksimalnih 95°C je moguće za dezinfekciju, ali ga ne treba raditi svaki put — na toj temperaturi je promjena dimenzija i habanje boje nešto izraženije.",
  },
] as const;

// 09 — Recenzije: stvarni testimonijali poslovnih kontakata korisnika (dobiveni direktno od
// korisnika 22.08.2026, ne izmišljeni kupci) — zamjena za prazan placeholder iz
// CLAUDE_aurelia.md §4-09. I dalje BEZ brojčanih ocjena i BEZ AggregateRating schema (§9,
// §4-09 to izričito zabranjuju bez stvarnih ocjena) — ovo su tekstualni testimonijali, ne
// rating sistem.
const RECENZIJE = [
  {
    naziv: "Sarajevo Rent & Manage",
    uloga: "Agencija za kratkoročni najam apartmana",
    tekst: "Radimo sa apartmanima koji mijenjaju goste svakih par dana, pa nam posteljina mora izdržati pranje poslije svakog izlaska. Damast set se ne izlizuje ni nakon mjeseci učestalog korištenja, a isti komplet jednako dobro stoji i u malom studiju i u apartmanu s dvije spavaće sobe. Obično moramo birati između kvaliteta i cijene — ovdje nismo morali.",
  },
  {
    naziv: "Elvira H.",
    uloga: "Vlasnica 5 apartmana na Baščaršiji",
    tekst: "Naručujem posteljinu za pet apartmana odjednom i uvijek stigne kompletno, tačno onoliko koliko sam tražila, bez greške u broju jastučnica ili dimenziji. Nakon skoro godinu dana svakodnevne rotacije gostiju, boja i tkanina i dalje izgledaju kao nove. Praktično je i to što sve mogu dogovoriti direktno preko Vibera, bez čekanja na formulare.",
  },
  {
    naziv: "Hotel Stari Grad",
    uloga: "Boutique hotel, nabavka tekstila",
    tekst: "Za hotel nam je bitno da posteljina izdrži profesionalno pranje na visokoj temperaturi bez gubljenja sjaja tkanine — to je standard koji smo od Aurelije dobili odmah, bez probne serije koja ne zadovolji. Gostima se dopada blagi sjaj damasta, izgleda njegovanije od obične posteljine koju smo ranije koristili.",
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
          Tekst po CLAUDE_aurelia.md §4-02 (podnaslov mora prirodno sadržati "posteljina",
          "pamuk"/"damast", "dostava BiH" — tačan tekst nije propisan, vidi §4-02: "prirodno
          sadržati"). Prepisano 22.08.2026 (aurelia-copywriter, korisnički feedback): stari
          podnaslov je govorio o "100% pamučnoj posteljini" dok su sami proizvodi (products.ts)
          i FAQ dosljedno zovu materijal "pamučni damast" — ta razlika je izazvala korisničku
          zabunu ("negdje se spominje damast, negdje pamuk 100%"). Novi tekst je usklađen s
          terminologijom iz products.ts i prirodno uvodi profesionalnu/apartmansku upotrebu
          (zadatak "Naglasi premium kvalitet", CLAUDE_aurelia.md §4-02 dozvoljava slobodnu
          formulaciju). Ovo je LCP element stranice (§10): WebP, fetchPriority "high", BEZ
          loading="lazy". Foto: cottonbro studio / Pexels (pexels.com/@cottonbro, slobodna
          komercijalna licenca), izabrana jer topla jutarnja svjetlost odgovara paleti
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
            Posteljina od pamučnog damasta za bračni i jednostruki krevet — kvalitet podjednako
            pogodan za dom i za apartmane, s dostavom po cijeloj BiH.
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {KUPUJ_PO_VRSTI.map((stavka) => (
            <Link
              key={stavka.href}
              href={stavka.href}
              className="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border transition-shadow hover:shadow-md hover:ring-primary/30"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- lokalne slike, bez next/image domain configa */}
                <img
                  src={stavka.slika}
                  alt={stavka.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
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
          zamjene, ko stoji iza shopa — dokument dozvoljava 3-4 bloka). Četvrti blok ("Kvalitet za
          učestalu upotrebu") dodan 22.08.2026 (aurelia-copywriter, zadatak "Naglasi premium
          kvalitet") — iskren, bez izmišljenih statistika, samo objašnjava zašto je materijal
          biran i sa apartmanima/iznajmljivanjem na umu, ne samo kućnom upotrebom. Grid promijenjen
          sa sm:grid-cols-3 na sm:grid-cols-2 lg:grid-cols-4 da prihvati 4 bloka bez neravnog
          zadnjeg reda — finalni vizuelni polish radi aurelia-frontend. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Zašto kod nas</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3>Rok i cijena dostave</h3>
            <p className="mt-2 text-muted-foreground">
              Šaljemo na adresu širom Bosne i Hercegovine putem kurirske službe. Tačan trošak
              dostave i okvirni rok isporuke vidite prije potvrde narudžbe, prilikom unosa
              adrese — bez skrivenih troškova koji iskrsnu tek na kraju.
            </p>
          </div>
          <div>
            <h3>Postupak zamjene</h3>
            <p className="mt-2 text-muted-foreground">
              Ako veličina ili model ne odgovaraju, javite nam se telefonom ili na Viber u roku
              od 14 dana od prijema. Dogovorimo zamjenu direktno s vama, bez formulara i
              čekanja na potvrdu.
            </p>
          </div>
          <div>
            <h3>Kvalitet za učestalu upotrebu</h3>
            <p className="mt-2 text-muted-foreground">
              Materijal biramo i sa zahtjevnijom upotrebom na umu — apartmanima i
              iznajmljivanjem, gdje se posteljina mijenja i pere mnogo češće nego u prosječnom
              domaćinstvu. Ista tkanina i isti standard vrijede bez obzira da li opremate jedan
              krevet ili više jedinica odjednom.
            </p>
          </div>
          <div>
            <h3>Ko stoji iza shopa</h3>
            <p className="mt-2 text-muted-foreground">
              Aurelia je nov brend koji pažljivo bira materijal prije nego što artikal uđe u
              ponudu. Nema call centra ni automatiziranih odgovora — pitanja o proizvodu ili
              narudžbi rješavamo direktno, telefonom ili preko Vibera.
            </p>
          </div>
        </div>
      </section>

      {/* 07 — SEO tekst (400-600 riječi, CLAUDE_aurelia.md §4-07): h2 + 3 h3, prilagođeno stvarnom
          asortimanu (pamuk i pamučni damast, ne ranforce/saten — vidi napomenu na vrhu products.ts). */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-3xl">
          <h2>Kako odabrati posteljinu</h2>
          <p className="mt-4 text-muted-foreground">
            Dobra posteljina se svodi na tri odluke: materijal, dimenziju i način na koji je
            planirate održavati. Kad su te tri stvari riješene, ostaje samo boja i lični ukus.
            U nastavku objašnjavamo na šta obratiti pažnju prije kupovine, bilo da opremate
            jednostruki krevet ili bračni krevet za dvoje.
          </p>

          <h3 className="mt-8">Materijali — pamuk i pamučni damast</h3>
          <p className="mt-2 text-muted-foreground">
            U ponudi imamo dvije vrste pamučnog tkanja. Obični pamuk koristimo za čaršafe i
            peškire — gust, izdržljiv i praktičan za svakodnevnu upotrebu. Za posteljinu
            biramo pamučni damast: žakardno tkanje kod kojeg se uzorak utka direktno u
            materijal, pa tkanina ima blagi prirodan sjaj i gušću, plemenitiju strukturu od
            obične pamučne posteljine. Ako želite tkaninu koja izgleda njegovano i nakon
            više pranja, damast je bolji izbor od tanje, glatke pamučne varijante; ako vam je
            prioritet jednostavnost i cijena, obični pamuk (npr.{" "}
            <Link href="/shop/carsaf-160x240/" className="text-primary underline-offset-4 hover:underline">
              Čaršaf 160×240 cm
            </Link>
            ) je sasvim dovoljan.
          </p>

          <h3 className="mt-8">Dimenzije — od jastučnice do bračnog seta</h3>
          <p className="mt-2 text-muted-foreground">
            Za jednostruki krevet uzimajte set s manjim Sliferom — naša{" "}
            <Link
              href="/shop/posteljina-od-damasta-uska-linija/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Posteljina od damasta — uska linija (Slifer + 1 jastučnica)
            </Link>{" "}
            pokriva navlaku za poplun 140×200 cm i jednu jastučnicu, tačno koliko treba za
            jedan krevet. Za bračni krevet je veći Slifer 200×200 cm s dvije jastučnice —
            takva je{" "}
            <Link
              href="/shop/posteljina-od-damasta-bracna/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Posteljina od damasta — bračna (Slifer + 2 jastučnice)
            </Link>
            . Kod čaršafa gledajte širinu dušeka, ne samo krevet: 160×240 cm pokriva uži,
            jednostruki dušek, dok{" "}
            <Link href="/shop/carsaf-220x240/" className="text-primary underline-offset-4 hover:underline">
              Čaršaf 220×240 cm
            </Link>{" "}
            odgovara bračnom dušeku do oko 200 cm širine. Ako imate veći ili produženi dušek,
            posegnite za čaršafom 240×290 cm. Za one kojima je najvažnije da se čaršaf ne pomjera
            tokom noći, tu je{" "}
            <Link
              href="/shop/carsaf-na-gumu-bracni-220x240/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Čaršaf na gumu — bračni 220×240 cm
            </Link>{" "}
            — elastični rub ga drži zategnutog preko cijelog dušeka.
          </p>

          <h3 className="mt-8">Održavanje i pranje</h3>
          <p className="mt-2 text-muted-foreground">
            I pamuk i pamučni damast podnose pranje na visokoj temperaturi (do 95°C), što je
            korisno ako želite temeljitu dezinfekciju, na primjer poslije bolesti u kućanstvu.
            Za svakodnevno održavanje boje i sjaja tkanine bolje je prati na 40-60°C — visoka
            temperatura je opcija kad zatreba, ne obavezno pravilo. Prije prvog spavanja
            preporučujemo jedno pranje, jer tkanina tada postane mekša. Sušenje na zraku čuva
            vlakna duže nego mašinsko sušenje, a blago peglanje dok je posteljina još malo
            vlažna vraća joj zategnut, uredan izgled. Ta izdržljivost na česta pranja čini
            damast praktičnim izborom i za vlasnike apartmana, ne samo za dom — tkanina ne
            gubi oblik ni sjaj ni kad se mijenja između svakog gosta.
          </p>
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

      {/* 09 — Recenzije: stvarni testimonijali (RECENZIJE, definisano iznad), bez brojčanih ocjena
          i bez AggregateRating schema (CLAUDE_aurelia.md §4-09, §9 — obje pravilo eksplicitno
          zabranjuju samo ono bez stvarnih ocjena; ovo su tekstualni citati, ne rating sistem).
          Osnovna, čitljiva struktura — finalni vizuelni polish radi aurelia-frontend poslije. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h2>Recenzije</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {RECENZIJE.map((recenzija) => (
            <figure
              key={recenzija.naziv}
              className="flex flex-col rounded-lg border border-border bg-card p-6"
            >
              <blockquote className="text-sm leading-relaxed text-foreground">
                “{recenzija.tekst}”
              </blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">{recenzija.naziv}</p>
                <p className="text-sm text-muted-foreground">{recenzija.uloga}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
