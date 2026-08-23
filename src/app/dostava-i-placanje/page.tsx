// DOSTAVA I PLAĆANJE — CLAUDE_aurelia.md §2. Dostava: konzistentno sa FAQ na početnoj
// (src/app/page.tsx — "obično nekoliko radnih dana od potvrde", tačan trošak/rok vidi se na
// checkout-u, ne izmišljati cijenu dostave koja nigdje nije definisana). Plaćanje: 3 kartice u
// istom vizuelnom jeziku kao src/app/checkout/checkout-forma.tsx (NACINI_PLACANJA) — pouzeće i
// bankovni transfer aktivni, kartica/pay-by-link "uskoro dostupno". Header/Footer su globalni.

import type { Metadata } from "next";
import { Banknote, CreditCard, Truck } from "lucide-react";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Dostava i plaćanje | Aurelia.ba",
  description:
    "Dostava kurirskom službom po cijeloj BiH i tri načina plaćanja: pouzeće, bankovni transfer i kartica putem pay-by-link linka (uskoro).",
  alternates: {
    canonical: `${SITE_URL}/dostava-i-placanje/`,
  },
};

type NacinPlacanjaKartica = {
  naziv: string;
  opis: string;
  dostupno: boolean;
};

const NACINI_PLACANJA: NacinPlacanjaKartica[] = [
  {
    naziv: "Pouzeće",
    opis: "Platite gotovinom kuriru pri preuzimanju paketa — najčešći način plaćanja kod nas.",
    dostupno: true,
  },
  {
    naziv: "Bankovni transfer",
    opis: "Podaci za uplatu na račun šalju se odmah nakon potvrde narudžbe, na vaš email.",
    dostupno: true,
  },
  {
    naziv: "Kartica (online plaćanje putem sigurnog linka)",
    opis: "Plaćanje karticom putem pay-by-link servisa je u pripremi.",
    dostupno: false,
  },
];

export default function DostavaIPlacanjePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <h1>Dostava i plaćanje</h1>
      </div>

      <div className="mt-12 max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Truck className="size-5" aria-hidden="true" />
          </div>
          <h2>Dostava</h2>
        </div>
        <p className="text-muted-foreground">
          Narudžbe šaljemo kurirskom službom na adresu širom Bosne i Hercegovine. Narudžba je
          potvrđena odmah nakon slanja, a paket obično stigne u roku od nekoliko radnih dana.
        </p>
        <p className="text-muted-foreground">
          Tačan rok isporuke i trošak dostave vidite prije potvrde narudžbe, prilikom unosa
          adrese na stranici za završetak kupovine — trošak zavisi od destinacije, pa ga ne
          navodimo unaprijed kao fiksnu cifru.
        </p>
      </div>

      <div className="mt-16 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Banknote className="size-5" aria-hidden="true" />
          </div>
          <h2>Plaćanje</h2>
        </div>
        <p className="mt-4 text-muted-foreground">
          Trenutno nudimo tri načina plaćanja:
        </p>

        <div className="mt-6 space-y-3">
          {NACINI_PLACANJA.map((opcija) => (
            <div
              key={opcija.naziv}
              className={`flex items-start gap-3 rounded-lg border border-border bg-card p-4 ${
                opcija.dostupno ? "" : "opacity-60"
              }`}
            >
              <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{opcija.naziv}</span>
                  {!opcija.dostupno && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      Uskoro dostupno
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{opcija.opis}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
