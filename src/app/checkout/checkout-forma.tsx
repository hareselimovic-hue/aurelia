"use client";

// Forma za podatke kupca + izbor načina plaćanja. Odvojena od page.tsx da orkestrator (submit,
// slanje na API, potvrda) ostane čitljiv. Validacija je isključivo klijentska (required polja) —
// server (src/app/api/narudzbe/route.ts) radi svoju nezavisnu validaciju, ovo ne zamjenjuje nju.

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { NacinPlacanja } from "@/app/api/narudzbe/types";

export type FormaPodaci = {
  imePrezime: string;
  telefon: string;
  adresa: string;
  grad: string;
  napomena: string;
  nacinPlacanja: NacinPlacanja;
};

const PRAZNA_FORMA: FormaPodaci = {
  imePrezime: "",
  telefon: "",
  adresa: "",
  grad: "",
  napomena: "",
  nacinPlacanja: "pouzece",
};

type NacinPlacanjaOpcija = {
  vrijednost: NacinPlacanja;
  naziv: string;
  opis: string;
  dostupno: boolean;
};

// Opcija 3 (kartica) je namjerno onemogućena — korisnik ima postojeći pay-by-link servis, ali API
// detalji provajdera još nisu dostavljeni. UI mjesto je pripremljeno, integracija ne blokira
// ostatak checkout-a (vidi aurelia-frontend.md "Cart / checkout").
const NACINI_PLACANJA: NacinPlacanjaOpcija[] = [
  {
    vrijednost: "pouzece",
    naziv: "Pouzeće",
    opis: "Platite gotovinom kuriru pri preuzimanju paketa.",
    dostupno: true,
  },
  {
    vrijednost: "bankovni-transfer",
    naziv: "Bankovni transfer",
    opis: "Podaci za uplatu na račun šalju se nakon narudžbe.",
    dostupno: true,
  },
  {
    vrijednost: "kartica",
    naziv: "Kartica (online plaćanje putem sigurnog linka)",
    opis: "Uskoro dostupno.",
    dostupno: false,
  },
];

type PoljeGreske = Partial<Record<"imePrezime" | "telefon" | "adresa" | "grad", string>>;

export function CheckoutForma({
  onSubmit,
  saljemo,
  greska,
}: {
  onSubmit: (podaci: FormaPodaci) => void;
  saljemo: boolean;
  greska: string | null;
}) {
  const [podaci, setPodaci] = useState<FormaPodaci>(PRAZNA_FORMA);
  const [poljaGreske, setPoljaGreske] = useState<PoljeGreske>({});

  function izmijeni<K extends keyof FormaPodaci>(polje: K, vrijednost: FormaPodaci[K]) {
    setPodaci((prev) => ({ ...prev, [polje]: vrijednost }));
  }

  function validiraj(): boolean {
    const nove: PoljeGreske = {};
    if (!podaci.imePrezime.trim()) nove.imePrezime = "Unesite ime i prezime.";
    if (!podaci.telefon.trim()) nove.telefon = "Unesite broj telefona.";
    if (!podaci.adresa.trim()) nove.adresa = "Unesite adresu za dostavu.";
    if (!podaci.grad.trim()) nove.grad = "Unesite grad.";
    setPoljaGreske(nove);
    return Object.keys(nove).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validiraj()) return;
    onSubmit(podaci);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <section>
        <h2 className="text-2xl">Podaci za dostavu</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="imePrezime">Ime i prezime *</Label>
            <Input
              id="imePrezime"
              autoComplete="name"
              value={podaci.imePrezime}
              onChange={(e) => izmijeni("imePrezime", e.target.value)}
              aria-invalid={Boolean(poljaGreske.imePrezime)}
              aria-describedby={poljaGreske.imePrezime ? "imePrezime-greska" : undefined}
              className="h-11"
            />
            {poljaGreske.imePrezime && (
              <p id="imePrezime-greska" className="text-sm text-destructive">
                {poljaGreske.imePrezime}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefon">Telefon *</Label>
            <Input
              id="telefon"
              type="tel"
              autoComplete="tel"
              value={podaci.telefon}
              onChange={(e) => izmijeni("telefon", e.target.value)}
              aria-invalid={Boolean(poljaGreske.telefon)}
              aria-describedby={poljaGreske.telefon ? "telefon-greska" : undefined}
              className="h-11"
            />
            {poljaGreske.telefon && (
              <p id="telefon-greska" className="text-sm text-destructive">
                {poljaGreske.telefon}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="grad">Grad *</Label>
            <Input
              id="grad"
              autoComplete="address-level2"
              value={podaci.grad}
              onChange={(e) => izmijeni("grad", e.target.value)}
              aria-invalid={Boolean(poljaGreske.grad)}
              aria-describedby={poljaGreske.grad ? "grad-greska" : undefined}
              className="h-11"
            />
            {poljaGreske.grad && (
              <p id="grad-greska" className="text-sm text-destructive">
                {poljaGreske.grad}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="adresa">Adresa *</Label>
            <Input
              id="adresa"
              autoComplete="street-address"
              value={podaci.adresa}
              onChange={(e) => izmijeni("adresa", e.target.value)}
              aria-invalid={Boolean(poljaGreske.adresa)}
              aria-describedby={poljaGreske.adresa ? "adresa-greska" : undefined}
              className="h-11"
            />
            {poljaGreske.adresa && (
              <p id="adresa-greska" className="text-sm text-destructive">
                {poljaGreske.adresa}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="napomena">Napomena (opciono)</Label>
            <Textarea
              id="napomena"
              placeholder="Npr. napomena za dostavu, željeni termin…"
              value={podaci.napomena}
              onChange={(e) => izmijeni("napomena", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl">Način plaćanja</h2>
        <div role="radiogroup" aria-label="Način plaćanja" className="mt-4 space-y-3">
          {NACINI_PLACANJA.map((opcija) => (
            <label
              key={opcija.vrijednost}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors",
                opcija.dostupno ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                // border-primary + bg-secondary za odabrano stanje — NE bg-accent (design-system.md
                // §1: accent "koristi se suzdržano, nikad kao velika površina"; secondary je token
                // namijenjen tačno ovakvim većim alt-pozadinama). Ispravljeno po eksternom dizajn
                // review-u 23.08.2026.
                opcija.dostupno &&
                  podaci.nacinPlacanja === opcija.vrijednost &&
                  "border-primary bg-secondary"
              )}
            >
              <input
                type="radio"
                name="nacinPlacanja"
                value={opcija.vrijednost}
                checked={podaci.nacinPlacanja === opcija.vrijednost}
                disabled={!opcija.dostupno}
                onChange={() => izmijeni("nacinPlacanja", opcija.vrijednost)}
                className="mt-1 size-4 accent-primary disabled:cursor-not-allowed"
              />
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
            </label>
          ))}
        </div>
      </section>

      {greska && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {greska}
        </p>
      )}

      <Button
        type="submit"
        disabled={saljemo}
        className="h-11 w-full px-8 text-sm font-medium tracking-[0.02em] sm:w-auto"
      >
        {saljemo ? "Slanje narudžbe…" : "Potvrdi narudžbu"}
      </Button>
    </form>
  );
}
