"use client";

// UI za filtere/sortiranje na shop stranici (CLAUDE_aurelia.md §5-03) — sidebar na desktopu,
// Sheet drawer na mobilnom (isti obrazac kao mobilni meni u src/components/layout/header.tsx).
// "use client" je ovdje SAMO zbog Sheet-a (Base UI dialog primitive treba interaktivnost) — sami
// linkovi rade i bez hidratacije jer su obični <Link href="?...">, filter state živi isključivo u
// URL-u (nikad u useState), po blokirajućem pravilu iz §5-03.

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAllProducts } from "@/lib/products";
import {
  CIJENA_OPCIJE,
  SORT_OPCIJE,
  VRSTA_OPCIJE,
  bojaOpcije,
  dimenzijaOpcije,
  formatDimenzija,
  hrefSaIzmjenom,
  materijalOpcije,
  type FilterKey,
  type ShopParams,
} from "./shop-filters";

function opcijaKlasa(aktivno: boolean): string {
  return `block rounded-md px-2 py-1.5 text-sm transition-colors ${
    aktivno
      ? "bg-muted font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  }`;
}

function FacetGroup({
  naslov,
  filterKey,
  opcije,
  current,
}: {
  naslov: string;
  filterKey: FilterKey;
  opcije: { value: string; label: string }[];
  current: ShopParams;
}) {
  const aktivnaVrijednost = current[filterKey];

  return (
    <fieldset className="border-b border-border pb-5 last:border-0 last:pb-0">
      <legend className="text-eyebrow mb-3">{naslov}</legend>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href={hrefSaIzmjenom(current, filterKey, undefined)}
            aria-current={!aktivnaVrijednost ? "true" : undefined}
            className={opcijaKlasa(!aktivnaVrijednost)}
          >
            Sve
          </Link>
        </li>
        {opcije.map((opcija) => {
          const jeAktivno = aktivnaVrijednost === opcija.value;
          return (
            <li key={opcija.value}>
              <Link
                href={hrefSaIzmjenom(current, filterKey, jeAktivno ? undefined : opcija.value)}
                aria-current={jeAktivno ? "true" : undefined}
                className={opcijaKlasa(jeAktivno)}
              >
                {opcija.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/** Zajednički sadržaj filtera — dijeli ga desktop sidebar i mobilni Sheet drawer. */
function FilterFacets({ current }: { current: ShopParams }) {
  const proizvodi = getAllProducts();

  return (
    <div className="flex flex-col gap-5">
      <FacetGroup naslov="Vrsta" filterKey="vrsta" opcije={VRSTA_OPCIJE} current={current} />
      <FacetGroup
        naslov="Materijal"
        filterKey="materijal"
        opcije={materijalOpcije(proizvodi).map((m) => ({ value: m, label: m }))}
        current={current}
      />
      <FacetGroup
        naslov="Dimenzija"
        filterKey="dimenzija"
        opcije={dimenzijaOpcije(proizvodi).map((d) => ({ value: d, label: formatDimenzija(d) }))}
        current={current}
      />
      <FacetGroup
        naslov="Boja"
        filterKey="boja"
        opcije={bojaOpcije(proizvodi).map((b) => ({ value: b, label: b }))}
        current={current}
      />
      <FacetGroup naslov="Cijena" filterKey="cijena" opcije={CIJENA_OPCIJE} current={current} />
    </div>
  );
}

/** Desktop sidebar — vidljiv od `md:` naviše (CLAUDE_aurelia.md §5-03: "Sidebar na desktopu"). */
export function FiltersDesktop({ current }: { current: ShopParams }) {
  return (
    <aside className="hidden md:block">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium text-foreground">Filteri</h2>
        <Link
          href="/shop/"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Očisti sve
        </Link>
      </div>
      <FilterFacets current={current} />
    </aside>
  );
}

/** Mobilni drawer preko Sheet-a — isti obrazac kao mobilna navigacija u Header-u
 * (CLAUDE_aurelia.md §5-03: "drawer na mobilnom"). */
export function FiltersMobile({ current }: { current: ShopParams }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="gap-2" />}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filteri
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filteri</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <FilterFacets current={current} />
        </div>
        <div className="mt-auto border-t border-border p-4">
          <SheetClose
            render={
              <Link
                href="/shop/"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              />
            }
          >
            Očisti sve filtere
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Sortiranje — CLAUDE_aurelia.md §5-03: "novo, cijena ↑, cijena ↓", uvijek noindex kad je
 * eksplicitno postavljeno u URL-u (shop-filters.ts `izracunajRobots`). "Novo" namjerno NIKAD ne
 * upisuje `sort=novo` u URL — to je zadani (prazan) state, pa ostaje indeksabilan; samo
 * "cijena-asc"/"cijena-desc" eksplicitno postavljaju parametar. */
export function SortLinks({ current, className }: { current: ShopParams; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <span className="text-eyebrow mr-1 hidden sm:inline">Sortiraj:</span>
      {SORT_OPCIJE.map((opcija) => {
        const vrijednostZaHref = opcija.value === "novo" ? undefined : opcija.value;
        const jeAktivno =
          vrijednostZaHref === undefined ? !current.sort : current.sort === vrijednostZaHref;
        return (
          <Link
            key={opcija.value}
            href={hrefSaIzmjenom(current, "sort", vrijednostZaHref)}
            aria-current={jeAktivno ? "true" : undefined}
            className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              jeAktivno
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {opcija.label}
          </Link>
        );
      })}
    </div>
  );
}
