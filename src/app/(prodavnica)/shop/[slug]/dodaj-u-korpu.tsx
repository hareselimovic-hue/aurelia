"use client";

// Client pod-komponenta za proizvodnu stranicu (src/app/shop/[slug]/page.tsx) — stranica sama
// ostaje server component, ovdje ide jedini dio koji treba interaktivnost: izbor dimenzije (ako
// proizvod ima više od jedne) + "Dodaj u korpu" dugme wireovano na useCart().addItem
// (CLAUDE_aurelia.md §7, aurelia-frontend.md "Cart / checkout").

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { Proizvod } from "@/lib/products";

export function DodajUKorpu({ proizvod }: { proizvod: Proizvod }) {
  const { addItem } = useCart();
  const [dimenzija, setDimenzija] = useState(proizvod.dimenzije[0] ?? "");
  const [dodano, setDodano] = useState(false);

  const imaViseDimenzija = proizvod.dimenzije.length > 1;
  // Pravi birač (klikljiv, mijenja šta se dodaje u korpu) SAMO kad `dimenzijeSuIzbor` eksplicitno
  // kaže da su ponuđene veličine alternative istog artikla — CLAUDE_aurelia.md §7: "izbor
  // dimenzije (ako proizvod ima više dimenzija)". Kad `dimenzijeSuIzbor` nije postavljeno (npr. set
  // proizvodi, damast bračna), lista je i dalje vidljiva ali NEKLIKLJIVA — to su komponente koje se
  // dobijaju zajedno, ne alternative (korisnički feedback 23.08.2026: klikljiv birač je zbunjivao
  // kupce jer izbor ništa nije mijenjao).
  const izborAktivan = imaViseDimenzija && proizvod.dimenzijeSuIzbor === true;

  function handleDodaj() {
    addItem(proizvod, izborAktivan ? dimenzija || undefined : undefined, 1);
    setDodano(true);
    window.setTimeout(() => setDodano(false), 2000);
  }

  return (
    <div className="space-y-4">
      {izborAktivan && (
        <div>
          <p id="dimenzija-label" className="text-eyebrow text-foreground">
            Dimenzija
          </p>
          <div
            role="radiogroup"
            aria-labelledby="dimenzija-label"
            className="mt-2 flex flex-wrap gap-2"
          >
            {proizvod.dimenzije.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={dimenzija === d}
                onClick={() => setDimenzija(d)}
                className={cn(
                  "h-10 rounded-lg border px-4 text-sm font-medium transition-colors",
                  dimenzija === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : // active: ponavlja hover: (23.08.2026) — :hover ne okida na dodir, pa bez
                      // ovoga dodirivanje neizabrane dimenzije na mobilnom ne pokazuje ništa.
                      "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted active:border-primary/40 active:bg-muted"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {imaViseDimenzija && !izborAktivan && (
        <div>
          <p className="text-eyebrow text-foreground">Set sadrži</p>
          {/* Neklikljive "chip" oznake — vizuelno slične biraču, ali bez button/radio semantike,
              hover ili aktivnog stanja, jer nema šta da se bira (sve stavke idu zajedno). */}
          <div className="mt-2 flex flex-wrap gap-2">
            {proizvod.dimenzije.map((d) => (
              <span
                key={d}
                className="h-10 rounded-lg border border-border bg-muted px-4 text-sm font-medium leading-10 text-foreground"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        disabled={!proizvod.naStanju}
        onClick={handleDodaj}
        className="h-11 w-full px-8 text-sm font-medium tracking-[0.02em] sm:w-auto"
      >
        {proizvod.naStanju ? (dodano ? "Dodano u korpu" : "Dodaj u korpu") : "Nema na stanju"}
      </Button>
      <span aria-live="polite" className="sr-only">
        {dodano ? "Proizvod je dodan u korpu." : ""}
      </span>
    </div>
  );
}
