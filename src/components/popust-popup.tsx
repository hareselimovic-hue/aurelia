"use client";

// Popup "ostavi email, dobij 10%" (korisnik, 19.11.2026) — otvara se nakon 6 s na stranici.
// Ne prikazuje se: na /checkout/, nakon prijave, ni 7 dana nakon zatvaranja.
// Isti komponent hvata ?promo=KOD iz linka u mailu (bilo koja stranica) i pamti kod u localStorage —
// checkout (promo-kod.tsx) ga onda automatski primjenjuje u korpi.

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MOJ_KOD_KLJUC } from "@/components/preporuka-kutija";
import { pratiMeta } from "@/lib/meta-pixel";
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

const NATPIS_SKRIVEN_KLJUC = "aurelia-popup-natpis-skriven";
const OTVORI_DOGADJAJ = "aurelia:otvori-popust";
const PRIJAVLJEN_DOGADJAJ = "aurelia:popust-prijavljen";

// Checkout ima svoje polje za kod, a nagradna igra već daje isti kod — popup/natpis bi smetali.
function bezPopupa(pathname: string | null): boolean {
  return Boolean(
    pathname?.startsWith("/checkout") ||
      pathname?.startsWith("/nagradna-igra") ||
      pathname?.startsWith("/recenzija") ||
      pathname?.startsWith("/podijeli") ||
      pathname?.startsWith("/poklon"),
  );
}

export function otvoriPopustPopup() {
  window.dispatchEvent(new Event(OTVORI_DOGADJAJ));
}

function procitajSesiju(kljuc: string): string | null {
  try {
    return sessionStorage.getItem(kljuc);
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
  // Mali natpis "−10%" dolje lijevo — pojavi se kad je popup zatvoren bez prijave, da se akcija
  // može iskoristiti i kasnije (korisnik, 20.11.2026). × ga skriva do kraja sesije.
  const [natpis, setNatpis] = useState(false);

  // Kod iz linka u mailu (?promo=AUR-XXXXXX) → zapamti za checkout, popup više ne treba.
  useEffect(() => {
    const kod = new URLSearchParams(window.location.search).get("promo");
    // Kupac je kliknuo SVOJ link preporuke (zapamćen na /podijeli/ ili /recenzija/) — ne primjenjuj.
    if (kod && procitaj(MOJ_KOD_KLJUC) === kod.trim().toUpperCase()) return;
    if (kod) {
      upisi(PROMO_STORAGE_KLJUC, kod.trim().toUpperCase());
      upisi(POPUP_STORAGE_KLJUC, "prijavljen");
    }
  }, []);

  // Otvaranje iz drugih komponenti (link "Nemate kod?" u korpi/checkoutu) — otvoriPopustPopup().
  useEffect(() => {
    const otvori = () => setOtvoren(true);
    window.addEventListener(OTVORI_DOGADJAJ, otvori);
    return () => window.removeEventListener(OTVORI_DOGADJAJ, otvori);
  }, []);

  useEffect(() => {
    const stanje = procitaj(POPUP_STORAGE_KLJUC);
    if (stanje === "prijavljen") return;
    if (stanje && Date.now() - Number(stanje) < PAUZA_NAKON_ZATVARANJA_MS) {
      // Odgođeno (ne sinhrono u effectu) — localStorage se čita tek na klijentu, nakon hidracije.
      const t = window.setTimeout(
        () => setNatpis(procitajSesiju(NATPIS_SKRIVEN_KLJUC) !== "1"),
        0,
      );
      return () => window.clearTimeout(t);
    }
    if (bezPopupa(pathname)) return;

    const tajmer = window.setTimeout(() => setOtvoren(true), KASNJENJE_MS);
    return () => window.clearTimeout(tajmer);
  }, [pathname]);

  function promjenaOtvorenosti(novo: boolean) {
    setOtvoren(novo);
    if (novo || poslano) return;
    if (procitaj(POPUP_STORAGE_KLJUC) !== "prijavljen") {
      upisi(POPUP_STORAGE_KLJUC, String(Date.now()));
      setNatpis(procitajSesiju(NATPIS_SKRIVEN_KLJUC) !== "1");
    }
  }

  function sakrijNatpis() {
    setNatpis(false);
    try {
      sessionStorage.setItem(NATPIS_SKRIVEN_KLJUC, "1");
    } catch {
      // storage nedostupan — natpis se samo vrati pri sljedećem učitavanju
    }
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
        pratiMeta("Lead", { content_name: "popup-10" });
        setPoslano(true);
        setNatpis(false);
        upisi(POPUP_STORAGE_KLJUC, "prijavljen");
        window.dispatchEvent(new Event(PRIJAVLJEN_DOGADJAJ));
      } else {
        setGreska(rezultat.greska);
      }
    } catch {
      setGreska("Slanje nije uspjelo. Pokušajte ponovo.");
    } finally {
      setSaljem(false);
    }
  }

  const naCheckoutu = bezPopupa(pathname);

  return (
    <>
      {natpis && !otvoren && !naCheckoutu && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center rounded-full bg-cta text-cta-foreground shadow-lg">
          <button
            type="button"
            onClick={() => setOtvoren(true)}
            className="py-2 pr-1 pl-4 text-sm font-medium"
          >
            −10% na prvu narudžbu
          </button>
          <button
            type="button"
            onClick={sakrijNatpis}
            aria-label="Sakrij ponudu"
            className="flex size-8 items-center justify-center rounded-full opacity-70 hover:opacity-100"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}
      <Dialog open={otvoren} onOpenChange={promjenaOtvorenosti}>
        <DialogContent className="gap-0 p-6 sm:max-w-md">
          {poslano ? (
            <div className="space-y-3 pt-2 text-center">
              <DialogTitle className="text-2xl">Provjerite email</DialogTitle>
              <DialogDescription className="text-base">
                Poslali smo vam kod za 10% popusta na{" "}
                <strong>{email.trim()}</strong>. Kliknite dugme u mailu i popust
                će biti automatski primijenjen u korpi.
              </DialogDescription>
              <Button
                variant="cta"
                className="mt-2 h-11 w-full"
                onClick={() => setOtvoren(false)}
              >
                Nastavi kupovinu
              </Button>
            </div>
          ) : (
            <form onSubmit={posalji} noValidate className="space-y-4 pt-2">
              <div className="space-y-2 text-center">
                <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                  Dobrodošli na aurelia.ba
                </p>
                <DialogTitle className="text-3xl leading-tight">
                  10% popusta na prvu narudžbu
                </DialogTitle>
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
                  <p
                    id="popup-email-greska"
                    className="text-sm text-destructive"
                  >
                    {greska}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="cta"
                disabled={saljem}
                className="h-11 w-full"
              >
                {saljem ? "Šaljemo…" : "Pošalji mi kod"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Prijavom pristajete da vam povremeno šaljemo Aurelia ponude.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Link "Nemate kod? Ostavite email i dobijte 10%" za korpu i checkout — otvara isti popup.
 * Ne prikazuje se ko se već prijavio (ili je došao preko linka iz maila).
 */
export function PopustLink({ className }: { className?: string }) {
  const [prikazi, setPrikazi] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(
      () => setPrikazi(procitaj(POPUP_STORAGE_KLJUC) !== "prijavljen"),
      0,
    );
    const sakrij = () => setPrikazi(false);
    window.addEventListener(PRIJAVLJEN_DOGADJAJ, sakrij);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(PRIJAVLJEN_DOGADJAJ, sakrij);
    };
  }, []);

  if (!prikazi) return null;

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Nemate kod?{" "}
      <button
        type="button"
        onClick={otvoriPopustPopup}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Ostavite email i dobijte 10% popusta
      </button>
    </p>
  );
}
