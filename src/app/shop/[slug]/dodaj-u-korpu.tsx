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

  // Naši trenutni proizvodi uglavnom imaju samo jednu dimenziju, ali birač mora raditi i kad ih
  // ima više (npr. buduci proizvodi sa 140x200 / 160x200 / 200x200 varijantama) — CLAUDE_aurelia.md
  // §7: "izbor dimenzije (ako proizvod ima više dimenzija)".
  const imaViseDimenzija = proizvod.dimenzije.length > 1;

  function handleDodaj() {
    addItem(proizvod, dimenzija || undefined, 1);
    setDodano(true);
    window.setTimeout(() => setDodano(false), 2000);
  }

  return (
    <div className="space-y-4">
      {imaViseDimenzija && (
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
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted"
                )}
              >
                {d}
              </button>
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
