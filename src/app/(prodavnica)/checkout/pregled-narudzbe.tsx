// Pregled narudžbe (sidebar na checkout-u): stavke, količine, ukupno. Čisto prezentaciono, prima
// stavke i ukupnu cijenu odozgo (src/app/checkout/page.tsx) — ne čita cart context direktno da bi
// ostao lako ponovo iskoristiv (npr. eventualno u email predlošku kasnije).

import type { ReactNode } from "react";

import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice } from "@/lib/format";
import type { StavkaKorpe } from "@/lib/cart-context";
import { PLACEHOLDER_IMAGE, cijenaStavke } from "@/lib/products";

export function PregledNarudzbe({
  items,
  totalPrice,
  cijenaDostave,
  popust = null,
  children,
}: {
  items: StavkaKorpe[];
  totalPrice: number;
  /** `null` = poštanski broj još nije unesen (src/lib/dostava.ts). */
  cijenaDostave: number | null;
  popust?: { kod: string; procenat: number; iznos: number } | null;
  /** Mjesto za polje promo koda (iznad zbira). */
  children?: ReactNode;
}) {
  return (
    <div className="h-fit rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl">Vaša narudžba</h2>

      <ul className="mt-4 space-y-4">
        {items.map((stavka) => {
          const glavnaSlika = stavka.proizvod.slike[0];
          const jePlaceholder = !glavnaSlika || glavnaSlika.url === PLACEHOLDER_IMAGE;

          return (
            <li key={`${stavka.proizvod.slug}__${stavka.dimenzija ?? ""}`} className="flex gap-3">
              <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {jePlaceholder ? (
                  <PlaceholderImage alt={glavnaSlika?.alt ?? stavka.proizvod.naziv} />
                ) : (
                  <img
                    src={glavnaSlika.url}
                    alt={glavnaSlika.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm leading-snug font-medium text-foreground">
                  {stavka.proizvod.naziv}
                </p>
                {stavka.dimenzija && (
                  <p className="text-xs text-muted-foreground">{stavka.dimenzija}</p>
                )}
                <p className="text-xs text-muted-foreground">Količina: {stavka.kolicina}</p>
              </div>

              <span className="shrink-0 text-sm font-medium text-foreground">
                {formatPrice(cijenaStavke(stavka.proizvod, stavka.dimenzija) * stavka.kolicina)}
              </span>
            </li>
          );
        })}
      </ul>

      {children && <div className="mt-6 border-t border-border pt-4">{children}</div>}

      <div className="mt-6 space-y-2 border-t border-border pt-4">
        {popust && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Popust ({popust.procenat}%)</span>
            <span className="font-medium text-foreground">−{formatPrice(popust.iznos)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dostava</span>
          {cijenaDostave === null ? (
            <span className="text-muted-foreground">Unesite poštanski broj</span>
          ) : (
            <span className="font-medium text-foreground">{formatPrice(cijenaDostave)}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-medium text-foreground">Ukupno</span>
          <span className="text-xl font-semibold text-foreground">
            {formatPrice(totalPrice - (popust?.iznos ?? 0) + (cijenaDostave ?? 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
