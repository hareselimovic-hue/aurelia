"use client";

// Polje za promo kod u pregledu narudžbe. Kod se provjerava na /api/promo (kodovi nisu u
// klijentskom bundle-u); server ga pri slanju narudžbe ponovo provjerava i troši.
// Kod iz linka u mailu (popust-popup.tsx ga upiše u localStorage) se primjenjuje automatski.

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROMO_STORAGE_KLJUC } from "@/components/popust-popup";
import type { PromoOdgovor } from "@/app/api/narudzbe/types";

export type PrimijenjenPromo = { kod: string; procenat: number };

export function zaboraviSacuvaniKod() {
  try {
    localStorage.removeItem(PROMO_STORAGE_KLJUC);
  } catch {
    // storage nedostupan — nema šta brisati
  }
}

async function provjeri(kod: string): Promise<PromoOdgovor> {
  const odgovor = await fetch("/api/promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kod }),
  });
  return (await odgovor.json()) as PromoOdgovor;
}

export function PromoKod({
  primijenjen,
  onChange,
}: {
  primijenjen: PrimijenjenPromo | null;
  onChange: (promo: PrimijenjenPromo | null) => void;
}) {
  const [unos, setUnos] = useState("");
  const [provjeravam, setProvjeravam] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  // Automatska primjena sačuvanog koda (iz linka u mailu). Nevažeći/iskorišten kod se tiho briše.
  useEffect(() => {
    let sacuvan: string | null = null;
    try {
      sacuvan = localStorage.getItem(PROMO_STORAGE_KLJUC);
    } catch {
      return;
    }
    if (!sacuvan) return;
    let otkazano = false;
    provjeri(sacuvan)
      .then((rezultat) => {
        if (otkazano) return;
        if (rezultat.ok) onChange({ kod: rezultat.kod, procenat: rezultat.procenat });
        else zaboraviSacuvaniKod();
      })
      .catch(() => {});
    return () => {
      otkazano = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- samo jednom pri otvaranju checkouta
  }, []);

  async function primijeni(e: FormEvent) {
    e.preventDefault();
    if (!unos.trim()) {
      setGreska("Unesite promo kod.");
      return;
    }
    setGreska(null);
    setProvjeravam(true);
    try {
      const rezultat = await provjeri(unos);
      if (rezultat.ok) {
        onChange({ kod: rezultat.kod, procenat: rezultat.procenat });
        setUnos("");
      } else {
        setGreska(rezultat.greska);
      }
    } catch {
      setGreska("Provjera koda nije uspjela. Pokušajte ponovo.");
    } finally {
      setProvjeravam(false);
    }
  }

  if (primijenjen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2 text-sm">
        <span className="text-secondary-foreground">
          Kod <strong className="font-medium">{primijenjen.kod}</strong> (−{primijenjen.procenat}%)
        </span>
        <button
          type="button"
          onClick={() => {
            zaboraviSacuvaniKod();
            onChange(null);
          }}
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Ukloni
        </button>
      </div>
    );
  }

  // Zaseban <form> (nije unutar CheckoutForma) — Enter u ovom polju primjenjuje kod, ne šalje narudžbu.
  return (
    <form onSubmit={primijeni} noValidate className="space-y-1.5">
      <Label htmlFor="promoKod">Promo kod</Label>
      <div className="flex gap-2">
        <Input
          id="promoKod"
          value={unos}
          onChange={(e) => setUnos(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          aria-invalid={Boolean(greska)}
          aria-describedby={greska ? "promoKod-greska" : undefined}
          className="h-10"
        />
        <Button type="submit" variant="outline" disabled={provjeravam} className="h-10 shrink-0">
          {provjeravam ? "…" : "Primijeni"}
        </Button>
      </div>
      {greska && (
        <p id="promoKod-greska" className="text-sm text-destructive">
          {greska}
        </p>
      )}
    </form>
  );
}
