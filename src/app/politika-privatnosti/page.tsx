// POLITIKA PRIVATNOSTI — CLAUDE_aurelia.md §2. Polja podataka su tačno preuzeta iz
// src/app/checkout/checkout-forma.tsx (FormaPodaci: imePrezime, email, telefon, adresa, grad,
// napomena). Sajt trenutno ne koristi analytics/cookie skripte (provjereno pretragom koda) —
// ne tvrditi postojanje cookie consent bannera. Header/Footer su globalni.

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
            Sajt trenutno ne koristi analitičke ni marketinške kolačiće trećih strana. Ukoliko se
            to u budućnosti promijeni, ova stranica će biti ažurirana.
          </p>
        </div>
      </div>
    </div>
  );
}
