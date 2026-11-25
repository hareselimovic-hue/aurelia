// POLITIKA PRIVATNOSTI — CLAUDE_aurelia.md §2. Polja podataka su tačno preuzeta iz
// src/app/checkout/checkout-forma.tsx (FormaPodaci: imePrezime, email, telefon, adresa, grad,
// napomena). Kolačići: GTM (od 18.11.2026) + Meta Pixel (od 25.11.2026); cookie consent banner NE
// postoji — ne tvrditi ga. Header/Footer su globalni.

import type { Metadata } from "next";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Politika privatnosti | Aurelia.ba",
  description:
    "Koje podatke Aurelia.ba prikuplja prilikom narudžbe, zašto ih obrađuje, s kim ih dijeli i kakva su vaša prava.",
  alternates: {
    canonical: `${SITE_URL}/politika-privatnosti/`,
  },
};

const PODACI = [
  "ime i prezime",
  "email adresa",
  "broj telefona",
  "adresa za dostavu i grad",
  "napomena uz narudžbu (opciono, ako je unesete)",
];

export default function PolitikaPrivatnostiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <h1>Politika privatnosti</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Ova stranica objašnjava koje podatke prikupljamo kad naručite kod nas, zašto ih
          koristimo i kakva su vaša prava u vezi s njima.
        </p>
      </div>

      <div className="mt-12 max-w-3xl space-y-10">
        <div className="space-y-3">
          <h2>Koje podatke prikupljamo</h2>
          <p className="text-muted-foreground">
            Prilikom narudžbe, kroz formu na stranici za završetak kupovine, prikupljamo:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {PODACI.map((stavka) => (
              <li key={stavka}>{stavka}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2>Zašto prikupljamo ove podatke</h2>
          <p className="text-muted-foreground">
            Podatke koristimo isključivo da bismo obradili i potvrdili vašu narudžbu, dogovorili
            isporuku i kontaktirali vas telefonom ako je potrebno nešto razjasniti prije slanja
            paketa.
          </p>
          <p className="text-muted-foreground">
            Ako ostavite email da biste dobili kod za popust ili se prijavite u nagradnu igru,
            email koristimo za slanje koda, provođenje nagradne igre i povremene Aurelia ponude.
            Odjavu možete zatražiti u bilo kojem trenutku na info@aurelia.ba.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Dijeljenje podataka s trećim stranama</h2>
          <p className="text-muted-foreground">
            Vaše podatke ne dijelimo s trećim stranama, osim onih koji su nužni za isporuku
            narudžbe — kurirskoj službi prosljeđujemo ime, adresu, grad i telefon, isključivo
            radi dostave paketa.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Koliko dugo čuvamo podatke</h2>
          <p className="text-muted-foreground">
            Podatke čuvamo onoliko dugo koliko je potrebno za obradu narudžbe i eventualnu
            reklamaciju ili zamjenu, osim ako smo po zakonu obavezni čuvati određenu dokumentaciju
            (npr. računovodstvenu) i duže.
          </p>
        </div>

        <div className="space-y-3">
          <h2>Vaša prava</h2>
          <p className="text-muted-foreground">
            Imate pravo na uvid u podatke koje čuvamo o vama, njihovu ispravku ili brisanje.
            Za bilo šta od ovoga javite nam se na{" "}
            <a
              href="mailto:info@aurelia.ba"
              className="text-primary underline-offset-4 hover:underline"
            >
              info@aurelia.ba
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          <h2>Kolačići</h2>
          <p className="text-muted-foreground">
            Sajt koristi kolačiće i slične tehnologije dva servisa trećih strana:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Google</strong> (Google Tag Manager,
              Google Analytics i Google Ads) — za statistiku posjeta i mjerenje uspješnosti oglasa.
            </li>
            <li>
              <strong className="font-medium text-foreground">Meta</strong> (Facebook i Instagram
              Pixel) — za mjerenje uspješnosti oglasa na Facebooku i Instagramu i prikazivanje
              relevantnih oglasa. Bilježe se posjete stranicama, dodavanje u korpu, započinjanje i
              završetak narudžbe (vrijednost, ne vaši lični podaci iz forme).
            </li>
          </ul>
          <p className="text-muted-foreground">
            Ove kolačiće možete blokirati ili obrisati u postavkama svog pretraživača, a
            personalizovane oglase isključiti u postavkama svog Google i Facebook/Instagram naloga.
            Kupovina na sajtu radi i bez njih.
          </p>
        </div>
      </div>
    </div>
  );
}
