"use client";

// /korpa/ — lista stavki iz korpe, izmjena količine, uklanjanje, ukupan zbir, nastavak na
// checkout. Cijeli page je client component jer čita cart state (useCart) odmah pri prvom renderu
// da odluči prazno/puno stanje — vidi src/lib/cart-context.tsx (NE dirati taj fajl).

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice } from "@/lib/format";
import { useCart, type StavkaKorpe } from "@/lib/cart-context";
import { PLACEHOLDER_IMAGE } from "@/lib/products";

function RedStavke({ stavka }: { stavka: StavkaKorpe }) {
  const { removeItem, updateQuantity } = useCart();
  const { proizvod, dimenzija, kolicina } = stavka;

  const glavnaSlika = proizvod.slike[0];
  const jePlaceholder = !glavnaSlika || glavnaSlika.url === PLACEHOLDER_IMAGE;
  const zbirStavke = proizvod.cijena * kolicina;
  const href = `/shop/${proizvod.slug}/`;

  return (
    <li className="flex gap-4 border-b border-border py-6 first:pt-0 last:border-0 last:pb-0">
      <Link
        href={href}
        className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-24"
      >
        {jePlaceholder ? (
          <PlaceholderImage alt={glavnaSlika?.alt ?? proizvod.naziv} />
        ) : (
          <img
            src={glavnaSlika.url}
            alt={glavnaSlika.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base leading-snug">
              <Link href={href} className="text-foreground hover:text-primary">
                {proizvod.naziv}
              </Link>
            </h3>
            {dimenzija && <p className="mt-0.5 text-sm text-muted-foreground">{dimenzija}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(proizvod.slug, dimenzija)}
            aria-label={`Ukloni ${proizvod.naziv} iz korpe`}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">{formatPrice(proizvod.cijena)} / kom</p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(proizvod.slug, dimenzija, kolicina - 1)}
              disabled={kolicina <= 1}
              aria-label={`Smanji količinu za ${proizvod.naziv}`}
              className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <input
              type="number"
              min={1}
              value={kolicina}
              onChange={(e) => {
                const nova = Math.floor(Number(e.target.value));
                if (Number.isFinite(nova) && nova >= 1) {
                  updateQuantity(proizvod.slug, dimenzija, nova);
                }
              }}
              aria-label={`Količina za ${proizvod.naziv}`}
              className="h-9 w-12 border-x border-border bg-transparent text-center text-sm text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => updateQuantity(proizvod.slug, dimenzija, kolicina + 1)}
              aria-label={`Povećaj količinu za ${proizvod.naziv}`}
              className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          <span className="font-sans text-base font-semibold text-foreground">
            {formatPrice(zbirStavke)}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function KorpaPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1>Vaša korpa je prazna</h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          Dodajte proizvode iz ponude da biste nastavili sa kupovinom.
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
      <h1>Korpa</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul>
          {items.map((stavka) => (
            <RedStavke key={`${stavka.proizvod.slug}__${stavka.dimenzija ?? ""}`} stavka={stavka} />
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl">Ukupno</h2>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-base font-medium text-foreground">Za platiti</span>
            <span className="text-xl font-semibold text-foreground">{formatPrice(totalPrice)}</span>
          </div>

          <Link
            href="/checkout/"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium tracking-[0.02em] text-primary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_18%)]"
          >
            Nastavi na plaćanje
          </Link>
          <Link
            href="/shop/"
            className="mt-3 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Nastavi kupovinu
          </Link>
        </div>
      </div>
    </div>
  );
}
