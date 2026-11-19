"use client";

// Popup "ostavi email, dobij 10%" (korisnik, 19.11.2026) — otvara se nakon 6 s na stranici.
// Ne prikazuje se: na /checkout/, nakon prijave, ni 7 dana nakon zatvaranja.
// Isti komponent hvata ?promo=KOD iz linka u mailu (bilo koja stranica) i pamti kod u localStorage —
// checkout (promo-kod.tsx) ga onda automatski primjenjuje u korpi.

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PopustPrijavaOdgovor } from "@/app/api/narudzbe/types";

export const PROMO_STORAGE_KLJUC = "aurelia-promo";
const POPUP_STORAGE_KLJUC = "aurelia-popup";
const KASNJENJE_MS = 6000;
const PAUZA_NAKON_ZATVARANJA_MS = 7 * 24 * 60 * 60 * 1000;

function procitaj(kljuc: string): string | null {
  try {
    return localStorage.getItem(kljuc);
  } catch {
    return null;
  }
}

function upisi(kljuc: string, vrijednost: string) {
  try {
    localStorage.setItem(kljuc, vrijednost);
  } catch {
    // privatni prozor / blokiran storage — popup se samo može ponovo pojaviti, ništa ne puca
  }
}

export function PopustPopup() {
  const pathname = usePathname();
  const [otvoren, setOtvoren] = useState(false);
  const [email, setEmail] = useState("");
  const [saljem, setSaljem] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [poslano, setPoslano] = useState(false);

  // Kod iz linka u mailu (?promo=AUR-XXXXXX) → zapamti za checkout, popup više ne treba.
  useEffect(() => {
    const kod = new URLSearchParams(window.location.search).get("promo");
    if (kod) {
      upisi(PROMO_STORAGE_KLJUC, kod.trim().toUpperCase());
      upisi(POPUP_STORAGE_KLJUC, "prijavljen");
    }
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/checkout")) return;
    const stanje = procitaj(POPUP_STORAGE_KLJUC);
    if (stanje === "prijavljen") return;
    if (stanje && Date.now() - Number(stanje) < PAUZA_NAKON_ZATVARANJA_MS) return;

    const tajmer = window.setTimeout(() => setOtvoren(true), KASNJENJE_MS);
    return () => window.clearTimeout(tajmer);
  }, [pathname]);

  function promjenaOtvorenosti(novo: boolean) {
    setOtvoren(novo);
    if (!novo && !poslano) upisi(POPUP_STORAGE_KLJUC, String(Date.now()));
  }

  async function posalji(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGreska("Unesite ispravnu email adresu.");
      return;
    }
    setGreska(null);
    setSaljem(true);
    try {
      const odgovor = await fetch("/api/popust-prijava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const rezultat = (await odgovor.json()) as PopustPrijavaOdgovor;
      if (rezultat.ok) {
        setPoslano(true);
        upisi(POPUP_STORAGE_KLJUC, "prijavljen");
      } else {
        setGreska(rezultat.greska);
      }
    } catch {
      setGreska("Slanje nije uspjelo. Pokušajte ponovo.");
    } finally {
      setSaljem(false);
    }
  }

  return (
    <Dialog open={otvoren} onOpenChange={promjenaOtvorenosti}>
      <DialogContent className="gap-0 p-6 sm:max-w-md">
        {poslano ? (
          <div className="space-y-3 pt-2 text-center">
            <DialogTitle className="text-2xl">Provjerite email</DialogTitle>
            <DialogDescription className="text-base">
              Poslali smo vam kod za 10% popusta na <strong>{email.trim()}</strong>. Kliknite dugme
              u mailu i popust će biti automatski primijenjen u korpi.
            </DialogDescription>
            <Button variant="cta" className="mt-2 h-11 w-full" onClick={() => setOtvoren(false)}>
              Nastavi kupovinu
            </Button>
          </div>
        ) : (
          <form onSubmit={posalji} noValidate className="space-y-4 pt-2">
            <div className="space-y-2 text-center">
              <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                Dobrodošli u Aureliju
              </p>
              <DialogTitle className="text-3xl leading-tight">10% popusta na prvu narudžbu</DialogTitle>
              <DialogDescription className="text-base">
                Ostavite email i odmah vam šaljemo vaš lični kod za popust.
              </DialogDescription>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="popup-email" className="sr-only">
                Email adresa
              </label>
              <Input
                id="popup-email"
                type="email"
                autoComplete="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(greska)}
                aria-describedby={greska ? "popup-email-greska" : undefined}
                className="h-11"
              />
              {greska && (
                <p id="popup-email-greska" className="text-sm text-destructive">
                  {greska}
                </p>
              )}
            </div>
            <Button type="submit" variant="cta" disabled={saljem} className="h-11 w-full">
              {saljem ? "Šaljemo…" : "Pošalji mi kod"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Prijavom pristajete da vam povremeno šaljemo Aurelia ponude.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
