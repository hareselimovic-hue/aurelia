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
  // Predstavnik za meta liniju "materijal · dimenzija" — čisto informativan prikaz, uvijek prva
  // stavka (npr. za setove pokazuje anchor komad, "Slifer 140×200 cm (2×)").
  const dimenzija = proizvod.dimenzije[0] ?? "";
  // ALI: šta se stvarno lijepi na korpu-stavku je druga stvar. Kad ima više dimenzija koje NISU
  // pravi izbor (setovi/bundle proizvodi, dimenzijeSuIzbor nije true), ne šaljemo prvu stavku kao
  // da je "izabrana" — u korpi bi ispod naziva pisalo samo npr. "Slifer 140×200 cm (2×)", što
  // izgleda kao nepotpun/nasumičan izbor umjesto punog sadržaja seta (korisnički feedback
  // 23.08.2026). Isto pravilo kao DodajUKorpu na proizvodnoj stranici (shop/[slug]/dodaj-u-korpu.tsx).
  const jeBundleBezIzbora = proizvod.dimenzije.length > 1 && proizvod.dimenzijeSuIzbor !== true;
  const dimenzijaZaKorpu = jeBundleBezIzbora ? undefined : dimenzija || undefined;
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
        {/* Traka za "bedz" (npr. "Ušteda 15%" na set proizvodima, korisnik 23.08.2026) — gornji
            desni ugao (lijevi je rezervisan za "Nema na stanju"). Terracotta/--destructive boja po
            design-system.md §1: "Sniženje (nova cijena/bedž)" je tačno namjena ovog tokena.
            NAPOMENA: namjerno NE koristi .text-eyebrow klasu — ona sama postavlja
            text-muted-foreground boju koja pobjeđuje nad text-destructive-foreground (cascade
            layer sudar), zbog čega je tekst bio skoro nevidljiv na terakota pozadini (korisnički
            feedback 23.08.2026). Ovdje se ista tipografija (xs/semibold/tracking/uppercase)
            ponavlja ručno, bez sukoba boje. */}
        {proizvod.bedz && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-destructive-foreground uppercase">
            {proizvod.bedz}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-heading text-base font-medium leading-snug text-foreground line-clamp-2 group-hover:text-primary">
          <Link href={href}>{proizvod.naziv}</Link>
        </h3>

        {/* Korisnički feedback 23.08.2026 (drugi krug): ako naziv proizvoda već opisuje sadržaj
            (npr. "bračna (Slifer + 2 jastučnice)"), taksativna lista ispod je suvišna — dovoljna
            je ista kratka meta linija kao kod jednostavnih proizvoda. Puna itemizacija (i dalje
            potrebna, jer naziv "Puni set posteljine — ..." NE opisuje svih 5-6 komponenti) ostaje
            SAMO za "puni set" proizvode (`bedz` je jedini pouzdan signal za njih), i to u istom
            jednorednom "stavka · stavka · stavka" formatu kao meta linija — ne vertikalna
            checklist, jer je previše produžavala karticu. */}
        {proizvod.bedz ? (
          <p className="text-xs text-muted-foreground">{proizvod.dimenzije.join(" · ")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {proizvod.materijal} · {dimenzija}
          </p>
        )}

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
          onClick={() => addItem(proizvod, dimenzijaZaKorpu, 1)}
          disabled={!proizvod.naStanju}
          // h-11 (44px) umjesto h-10 (40px) — minimalni touch target za mobilne uređaje
          // (eksterni dizajn review 23.08.2026, ui-ux-pro-max touch-target pravilo).
          // active: ponavlja hover: (23.08.2026, korisnički feedback: dodir na mobilnom nije davao
          // nikakav vizuelni signal) — :hover se ne okida pouzdano na dodir, :active da.
          className="mt-2 h-11 w-full rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground active:border-primary active:bg-primary active:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          Dodaj u korpu
        </button>
      </div>
    </article>
  );
}
