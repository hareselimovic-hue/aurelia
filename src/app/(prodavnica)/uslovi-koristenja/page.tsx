// USLOVI KORIŠTENJA — CLAUDE_aurelia.md §2. Standardan, razuman sadržaj za manji BiH e-commerce.
// Narudžba je potvrđena odmah nakon slanja (checkout, src/app/checkout/potvrda-narudzbe.tsx) —
// korisnik je 23.08.2026 eksplicitno uklonio telefonski kontakt iz ovog toka, potvrda i info o
// isporuci idu isključivo na email. Cijene u KM, mogu se mijenjati bez najave. Generička
// formulacija ograničenja odgovornosti, nije pravni savjet. Header/Footer su globalni.

import type { Metadata } from "next";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Uslovi korištenja | Aurelia.ba",
  description:
    "Uslovi korištenja sajta Aurelia.ba: kako nastaje narudžba, cijene u KM, ograničenje odgovornosti i mjerodavno pravo.",
  alternates: {
    canonical: `${SITE_URL}/uslovi-koristenja/`,
  },
};

export default function UsloviKoristenjaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <h1>Uslovi korištenja</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Ovi uslovi uređuju korištenje sajta aurelia.ba i način na koji nastaju narudžbe.
          Korištenjem sajta i slanjem narudžbe prihvatate ove uslove.
        </p>
      </div>

      <div className="mt-12 max-w-3xl space-y-10">
        <div className="space-y-3">
          <h2>Šta ovi uslovi pokrivaju</h2>
          <p className="text-muted-foreground">
            Uslovi se odnose na pregledavanje sajta, naručivanje proizvoda i komunikaciju s nama
            u vezi s narudžbom. Odvojeno od ovoga vrijede Politika privatnosti (obrada ličnih
            podataka) i stranica Reklamacije i povrat (postupak zamjene i reklamacije).
          </p>
        </div>

        <div className="space-y-3">
          <h2>Kako nastaje narudžba</h2>
          <p className="text-muted-foreground">
            Narudžbu kreirate popunjavanjem forme na stranici za završetak kupovine. Narudžba se
            smatra prihvaćenom u trenutku slanja forme — potvrdu narudžbe i informacije o
            isporuci šaljemo na email koji ste unijeli, bez potrebe za telefonskim dogovorom.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Cijene</h2>
          <p className="text-muted-foreground">
            Sve cijene na sajtu izražene su u konvertibilnim markama (KM) i mogu se mijenjati bez
            prethodne najave. Cijena koja se primjenjuje na vašu narudžbu je ona prikazana u
            trenutku slanja narudžbe.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Ograničenje odgovornosti</h2>
          <p className="text-muted-foreground">
            Trudimo se da su svi podaci na sajtu (opisi proizvoda, dimenzije, cijene) tačni i
            ažurni, ali ne možemo garantovati potpuno odsustvo grešaka. U mjeri u kojoj to
            dozvoljava zakon, ne odgovaramo za posrednu ili slučajnu štetu nastalu korištenjem
            sajta, osim u slučajevima za koje se odgovornost ne može ugovorno ograničiti.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Mjerodavno pravo</h2>
          <p className="text-muted-foreground">
            Na ove uslove primjenjuje se pravo Bosne i Hercegovine. Eventualne nesuglasice
            nastojimo prvo riješiti dogovorom direktno s vama, a u suprotnom je nadležan sud u
            Bosni i Hercegovini.
          </p>
        </div>
      </div>
    </div>
  );
}
