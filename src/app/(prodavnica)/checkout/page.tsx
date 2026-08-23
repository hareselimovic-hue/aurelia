"use client";

// /checkout/ — orkestrator: prazna-korpa stanje, forma + pregled narudžbe, slanje na
// /api/narudzbe, potvrda. Cijeli page je client component (isti razlog kao /korpa/page.tsx —
// vidi src/app/checkout/layout.tsx za metadata).

import { useState } from "react";
import Link from "next/link";

import { useCart } from "@/lib/cart-context";
import type { NarudzbaOdgovor, NarudzbaPayload } from "@/app/api/narudzbe/types";
import { CheckoutForma, type FormaPodaci } from "./checkout-forma";
import { PregledNarudzbe } from "./pregled-narudzbe";
import { PotvrdaNarudzbe } from "./potvrda-narudzbe";

export default function CheckoutPage() {
  const { items, totalPrice, updateQuantity } = useCart();
  const [saljemo, setSaljemo] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [potvrdjenaNarudzba, setPotvrdjenaNarudzba] = useState<{ brojNarudzbe: string } | null>(
    null
  );

  async function posaljiNarudzbu(podaci: FormaPodaci) {
    setGreska(null);
    setSaljemo(true);

    const payload: NarudzbaPayload = {
      kupac: {
        imePrezime: podaci.imePrezime.trim(),
        email: podaci.email.trim(),
        telefon: podaci.telefon.trim(),
        adresa: podaci.adresa.trim(),
        grad: podaci.grad.trim(),
        napomena: podaci.napomena.trim() || undefined,
      },
      nacinPlacanja: podaci.nacinPlacanja,
      stavke: items.map((stavka) => ({
        slug: stavka.proizvod.slug,
        naziv: stavka.proizvod.naziv,
        dimenzija: stavka.dimenzija,
        kolicina: stavka.kolicina,
        cijenaPoKomadu: stavka.proizvod.cijena,
      })),
      ukupnaCijena: totalPrice,
    };

    try {
      const odgovor = await fetch("/api/narudzbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const rezultat = (await odgovor.json()) as NarudzbaOdgovor;

      if (!odgovor.ok || !rezultat.ok) {
        setGreska(!rezultat.ok ? rezultat.greska : "Došlo je do greške pri slanju narudžbe.");
        setSaljemo(false);
        return;
      }

      // cart-context nema clearCart (namjerno se ne dira taj fajl) — korpa se prazni tako što se
      // svaka stavka pojedinačno "skine na 0" preko updateQuantity, koji interno uklanja stavku
      // kad je količina <= 0 (vidi src/lib/cart-context.tsx).
      items.forEach((stavka) => updateQuantity(stavka.proizvod.slug, stavka.dimenzija, 0));

      setPotvrdjenaNarudzba({ brojNarudzbe: rezultat.brojNarudzbe });
    } catch {
      setGreska(
        "Greška u komunikaciji sa serverom. Pokušajte ponovo ili nas kontaktirajte telefonom."
      );
      setSaljemo(false);
    }
  }

  // Provjeri potvrđenu narudžbu PRIJE provjere prazne korpe — nakon uspješnog slanja korpa je
  // namjerno ispražnjena (gore), pa bi obrnut redoslijed prikazao "korpa je prazna" umjesto potvrde.
  if (potvrdjenaNarudzba) {
    return <PotvrdaNarudzbe brojNarudzbe={potvrdjenaNarudzba.brojNarudzbe} />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1>Korpa je prazna</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          Nema stavki za plaćanje. Dodajte proizvode iz ponude da biste nastavili.
        </p>
        <Link
          href="/shop/"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_18%)]"
        >
          Pogledaj ponudu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <h1>Plaćanje</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <CheckoutForma onSubmit={posaljiNarudzbu} saljemo={saljemo} greska={greska} />
        <PregledNarudzbe items={items} totalPrice={totalPrice} />
      </div>
    </div>
  );
}
