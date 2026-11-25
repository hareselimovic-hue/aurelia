"use client";

// /checkout/ — orkestrator: prazna-korpa stanje, forma + pregled narudžbe, slanje na
// /api/narudzbe, potvrda. Cijeli page je client component (isti razlog kao /korpa/page.tsx —
// vidi src/app/checkout/layout.tsx za metadata).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useCart } from "@/lib/cart-context";
import { metaVrijednost, pratiMeta } from "@/lib/meta-pixel";
import { cijenaStavke } from "@/lib/products";
import { izracunajDostavu } from "@/lib/dostava";
import type { NarudzbaOdgovor, NarudzbaPayload } from "@/app/api/narudzbe/types";
import { CheckoutForma, PRAZNA_FORMA, type FormaPodaci } from "./checkout-forma";
import { PregledNarudzbe } from "./pregled-narudzbe";
import { PotvrdaNarudzbe } from "./potvrda-narudzbe";
import { PromoKod, zaboraviSacuvaniKod, type PrimijenjenPromo } from "./promo-kod";

export default function CheckoutPage() {
  const { items, totalPrice, updateQuantity } = useCart();
  const [podaci, setPodaci] = useState<FormaPodaci>(PRAZNA_FORMA);
  const [saljemo, setSaljemo] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [potvrdjenaNarudzba, setPotvrdjenaNarudzba] = useState<{ brojNarudzbe: string } | null>(
    null
  );

  // Cijena dostave se prikazuje uživo (PregledNarudzbe) dok kupac kuca poštanski broj — server
  // (route.ts) je nezavisno preračunava iz iste vrijednosti, ovo je samo za prikaz prije slanja.
  const cijenaDostave = izracunajDostavu(podaci.postanskiBroj);

  // Popust samo za prikaz — server (route.ts) ga nezavisno računa iz koda. Ista formula kao
  // izracunajPopust u src/lib/promo.ts (taj fajl je server-only, pa se ne uvozi ovdje).
  const [promo, setPromo] = useState<PrimijenjenPromo | null>(null);
  const popust = promo ? Math.round(totalPrice * promo.procenat) / 100 : 0;

  // Meta Pixel InitiateCheckout — jednom, kad se korpa učita (cart-context je puni iz localStorage
  // nakon prvog renderovanja, pa se čeka da stavke postoje).
  const checkoutPracen = useRef(false);
  useEffect(() => {
    if (checkoutPracen.current || items.length === 0) return;
    checkoutPracen.current = true;
    pratiMeta("InitiateCheckout", {
      content_ids: items.map((s) => s.proizvod.slug),
      content_type: "product",
      num_items: items.reduce((z, s) => z + s.kolicina, 0),
      ...metaVrijednost(totalPrice),
    });
  }, [items, totalPrice]);

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
        postanskiBroj: podaci.postanskiBroj.trim(),
        napomena: podaci.napomena.trim() || undefined,
      },
      nacinPlacanja: podaci.nacinPlacanja,
      stavke: items.map((stavka) => ({
        slug: stavka.proizvod.slug,
        naziv: stavka.proizvod.naziv,
        dimenzija: stavka.dimenzija,
        kolicina: stavka.kolicina,
        cijenaPoKomadu: cijenaStavke(stavka.proizvod, stavka.dimenzija),
      })),
      ukupnaCijena: totalPrice,
      promoKod: promo?.kod,
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
      if (promo) zaboraviSacuvaniKod();

      // Meta Pixel Purchase — vrijednost = proizvodi nakon popusta, bez dostave.
      pratiMeta("Purchase", {
        content_ids: payload.stavke.map((s) => s.slug),
        content_type: "product",
        num_items: payload.stavke.reduce((z, s) => z + s.kolicina, 0),
        ...metaVrijednost(totalPrice - popust),
      });
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
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-cta px-8 font-medium text-cta-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--cta),var(--foreground)_12%)] active:bg-[color-mix(in_oklch,var(--cta),var(--foreground)_12%)]"
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
        <CheckoutForma
          podaci={podaci}
          onChange={setPodaci}
          onSubmit={posaljiNarudzbu}
          saljemo={saljemo}
          greska={greska}
        />
        <PregledNarudzbe
          items={items}
          totalPrice={totalPrice}
          cijenaDostave={cijenaDostave}
          popust={promo ? { kod: promo.kod, procenat: promo.procenat, iznos: popust } : null}
        >
          <PromoKod primijenjen={promo} onChange={setPromo} />
        </PregledNarudzbe>
      </div>
    </div>
  );
}
