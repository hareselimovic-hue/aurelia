"use client";

// Slide-out panel koji se otvara zdesna kad se doda proizvod u korpu (okinuto iz addItem u
// src/lib/cart-context.tsx) — zamjena za raniju toast notifikaciju (korisnički feedback
// 27.08.2026: "napraviti slider koji se otvara desno... dole dugmad nastavi kupovinu i nastavi
// plaćanje"). Količine se mogu mijenjati direktno u panelu (isti obrazac kao /korpa/ stranica).
//
// Mount tačka je jedna, unutar CartProvider-a (cart-context.tsx) — komponenta čita open/close
// stanje iz istog konteksta, ne treba poseban provider.

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
    <li className="flex gap-3 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0">
      <Link
        href={href}
        className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
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
            <h3 className="text-sm leading-snug font-medium">
              <Link href={href} className="text-foreground hover:text-primary">
                {proizvod.naziv}
              </Link>
            </h3>
            {dimenzija && <p className="mt-0.5 text-xs text-muted-foreground">{dimenzija}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(proizvod.slug, dimenzija)}
            aria-label={`Ukloni ${proizvod.naziv} iz korpe`}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(proizvod.slug, dimenzija, kolicina - 1)}
              disabled={kolicina <= 1}
              aria-label={`Smanji količinu za ${proizvod.naziv}`}
              className="flex size-7 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-3" aria-hidden="true" />
            </button>
            <span className="w-7 text-center text-xs text-foreground">{kolicina}</span>
            <button
              type="button"
              onClick={() => updateQuantity(proizvod.slug, dimenzija, kolicina + 1)}
              aria-label={`Povećaj količinu za ${proizvod.naziv}`}
              className="flex size-7 items-center justify-center text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="size-3" aria-hidden="true" />
            </button>
          </div>

          <span className="text-sm font-semibold text-foreground">{formatPrice(zbirStavke)}</span>
        </div>
      </div>
    </li>
  );
}

export function KorpaDrawer() {
  const { items, totalPrice, drawerOtvoren, setDrawerOtvoren } = useCart();

  return (
    <Sheet open={drawerOtvoren} onOpenChange={setDrawerOtvoren}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Korpa{items.length > 0 ? ` (${items.length})` : ""}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-muted-foreground">Vaša korpa je prazna.</p>
            <SheetClose
              render={
                <Link
                  href="/shop/"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                />
              }
            >
              Pogledaj ponudu
            </SheetClose>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-4">
            {items.map((stavka) => (
              <RedStavke
                key={`${stavka.proizvod.slug}__${stavka.dimenzija ?? ""}`}
                stavka={stavka}
              />
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm font-medium text-foreground">Za platiti</span>
              <span className="text-lg font-semibold text-foreground">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Link
              href="/checkout/"
              onClick={() => setDrawerOtvoren(false)}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium tracking-[0.02em] text-primary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_18%)]"
            >
              Nastavi na plaćanje
            </Link>
            <SheetClose render={<Button variant="outline" className="w-full" />}>
              Nastavi kupovinu
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
