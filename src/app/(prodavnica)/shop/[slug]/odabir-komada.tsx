"use client";

// Odabir komada s količinama (korisnik, 18.11.2026) — za proizvode s `opcije` (damast glat).
// Kupac u jednom koraku upiše koliko želi kompletnih setova i/ili pojedinačnih komada iz seta,
// ukupna cijena se računa uživo, a jedno "Dodaj u korpu" dodaje sve stavke s količinom > 0.
// Prije ovoga je bio radio birač (jedna opcija po dodavanju) — korisnik: "moraju izabrati jedno,
// dodati u korpu, pa se vratiti pa opet". Namjerno SAMO komadi koji su u setu, ne sve veličine.

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import type { Proizvod } from "@/lib/products";

const MAKS_KOLICINA = 99;

export function OdabirKomada({ proizvod }: { proizvod: Proizvod }) {
  const { addItem } = useCart();
  const opcije = proizvod.opcije ?? [];
  // Default: 1 kompletan set, ostalo 0 — dugme odmah radi za najčešću kupovinu.
  const [kolicine, setKolicine] = useState<number[]>(() => opcije.map((_, i) => (i === 0 ? 1 : 0)));

  const ukupno = opcije.reduce((zbir, o, i) => zbir + o.cijena * (kolicine[i] ?? 0), 0);
  const ukupnoKomada = kolicine.reduce((a, b) => a + b, 0);

  function postavi(i: number, vrijednost: number) {
    const ispravna = Math.max(0, Math.min(MAKS_KOLICINA, Math.floor(vrijednost) || 0));
    setKolicine((prev) => prev.map((k, j) => (j === i ? ispravna : k)));
  }

  function handleDodaj() {
    opcije.forEach((o, i) => {
      const k = kolicine[i] ?? 0;
      if (k > 0) addItem(proizvod, i === 0 ? undefined : o.naziv, k);
    });
  }

  function red(i: number) {
    const o = opcije[i];
    const k = kolicine[i] ?? 0;
    return (
      <div key={o.naziv} className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-base text-foreground">{o.naziv}</p>
          <p className="text-sm text-muted-foreground">{formatPrice(o.cijena)}</p>
        </div>
        <div className="inline-flex shrink-0 items-center rounded-lg border border-border bg-background">
          <button
            type="button"
            onClick={() => postavi(i, k - 1)}
            disabled={k <= 0}
            aria-label={`Smanji količinu: ${o.naziv}`}
            className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-muted disabled:text-muted-foreground/40 disabled:hover:bg-transparent"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAKS_KOLICINA}
            value={k}
            onChange={(e) => postavi(i, Number(e.target.value))}
            aria-label={`Količina: ${o.naziv}`}
            className="h-11 w-12 border-x border-border bg-transparent text-center text-base text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => postavi(i, k + 1)}
            disabled={k >= MAKS_KOLICINA}
            aria-label={`Povećaj količinu: ${o.naziv}`}
            className="flex size-11 items-center justify-center text-foreground transition-colors hover:bg-muted active:bg-muted disabled:text-muted-foreground/40"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="font-sans text-2xl font-semibold text-foreground">
        {formatPrice(opcije[0]?.cijena ?? proizvod.cijena)}
        <span className="ml-2 text-base font-normal text-muted-foreground">kompletan set</span>
      </p>

      <div>
        <p className="text-base font-medium text-foreground">Odaberite komade</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Uzmite kompletan set ili samo komade koji vam trebaju — upišite količinu za svaki.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-4 sm:px-5">
        <div className="border-b border-border py-1">
          <p className="pt-3 text-eyebrow text-muted-foreground">Set</p>
          {red(0)}
        </div>
        <div className="py-1">
          <p className="pt-3 text-eyebrow text-muted-foreground">Pojedinačno</p>
          <div className="divide-y divide-border">{opcije.slice(1).map((_, j) => red(j + 1))}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-base text-foreground" aria-live="polite">
          Ukupno: <span className="font-semibold">{formatPrice(ukupno)}</span>
        </p>
        <Button
          type="button"
          variant="cta"
          disabled={!proizvod.naStanju || ukupnoKomada === 0}
          onClick={handleDodaj}
          className="h-11 w-full px-8 text-sm font-medium tracking-[0.02em] sm:w-auto"
        >
          {proizvod.naStanju ? "Dodaj u korpu" : "Nema na stanju"}
        </Button>
      </div>
    </div>
  );
}
