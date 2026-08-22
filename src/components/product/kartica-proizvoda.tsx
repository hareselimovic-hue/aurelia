"use client";

import Link from "next/link";

import { PlaceholderImage } from "@/components/placeholder-image";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { PLACEHOLDER_IMAGE, type Proizvod } from "@/lib/products";

/**
 * Dijeljena kartica proizvoda — koristi se na početnoj, shopu i "slični proizvodi"
 * (CLAUDE_aurelia.md §6). Vizuelna implementacija je tačna kopija primjera iz
 * docs/design-system.md §4.2 (Tailwind klase, struktura, redoslijed elemenata).
 *
 * ==========================================================================================
 * GRID PRAVILO za stranice koje renderuju ovu komponentu u gridu (homepage §4-05, shop §5-04):
 *
 *     grid-cols-1 md:grid-cols-4
 *
 * 1 kolona na mobilnom, 4 kolone na desktopu. Ovo je NAMJERNO odstupanje od CLAUDE_aurelia.md
 * (koji traži "4 kolone desktop / 2 mobilni" — §4-05 i §5-04 dijele isti grid layout pravilo).
 * Korisnik je eksplicitno tražio 1 kolonu na mobilnom umjesto 2. Grid container ide u
 * homepage/shop stranicu, NE u ovu komponentu (kartica ne zna u kakvom je gridu).
 * ==========================================================================================
 */
export function KarticaProizvoda({
  proizvod,
  prioritet = false,
}: {
  proizvod: Proizvod;
  /** true za prvih 8 kartica u gridu — bez lazy loada (CLAUDE_aurelia.md §4-05). */
  prioritet?: boolean;
}) {
  const { addItem } = useCart();

  const glavnaSlika = proizvod.slike[0];
  const jePlaceholder = !glavnaSlika || glavnaSlika.url === PLACEHOLDER_IMAGE;
  // Predstavnik za meta liniju "materijal · dimenzija" i za dimenziju koja ide u korpu s jednim
  // klikom na "Dodaj u korpu" — izbor konkretne dimenzije (kad ih ima više) radi se na
  // proizvodnoj stranici, ne na kartici.
  const dimenzija = proizvod.dimenzije[0] ?? "";
  const href = `/shop/${proizvod.slug}/`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border transition-shadow hover:shadow-md hover:ring-primary/30">
      {/* slika 3:4, IKEA/White Company standard */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {jePlaceholder ? (
          <PlaceholderImage alt={glavnaSlika?.alt ?? proizvod.naziv} />
        ) : (
          // Napomena: <img> umjesto next/image je namjerno dok izvor pravih fotografija (CDN/CMS)
          // nije poznat — next/image zahtijeva unaprijed poznat domain config. Alt dolazi iz
          // atributa proizvoda (generisiAlt u products.ts), nikad iz imena fajla.
          <img
            src={glavnaSlika.url}
            alt={glavnaSlika.alt}
            loading={prioritet ? undefined : "lazy"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        {!proizvod.naStanju && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-eyebrow text-secondary-foreground">
            Nema na stanju
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-heading text-base font-medium leading-snug text-foreground line-clamp-2 group-hover:text-primary">
          <Link href={href}>{proizvod.naziv}</Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {proizvod.materijal} · {dimenzija}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-lg font-semibold text-foreground">
            {formatPrice(proizvod.cijena)}
          </span>
          {proizvod.cijenaStara !== undefined && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(proizvod.cijenaStara)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addItem(proizvod, dimenzija || undefined, 1)}
          disabled={!proizvod.naStanju}
          className="mt-2 h-10 w-full rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Dodaj u korpu
        </button>
      </div>
    </article>
  );
}
