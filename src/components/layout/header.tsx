"use client";

// Header (dijeljena komponenta) — CLAUDE_aurelia.md §4-01:
// "Logo (link na `/`) · navigacija · pretraga · korpa · telefon."
// - Navigacija maksimalno 5 stavki
// - Logo je <img> sa alt="[Brend] posteljina", NE CSS background
// - Telefon zamijenjen emailom kao kontakt kanalom (korisnik, 23.08.2026)

import Link from "next/link";
import { Mail, Menu, Search, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";

// Navigacija: maksimalno 5 stavki (CLAUDE_aurelia.md §4-01: "Početna, Shop, O nama, Kontakt").
const NAVIGACIJA = [
  { naziv: "Početna", href: "/" },
  { naziv: "Shop", href: "/shop/" },
  { naziv: "O nama", href: "/o-nama/" },
  { naziv: "Kontakt", href: "/kontakt/" },
];

const EMAIL = "info@aurelia.ba";

function KorpaIkonica() {
  const { totalCount } = useCart();
  return (
    <Link
      href="/korpa/"
      aria-label={`Korpa, ${totalCount} ${totalCount === 1 ? "stavka" : "stavki"}`}
      className="relative inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {totalCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}
    </Link>
  );
}

function PretragaPolje({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      {/* UI placeholder — nije još funkcionalna pretraga, dogovoriti se u sljedećem koraku. */}
      <Input
        type="search"
        placeholder="Pretraži posteljinu…"
        aria-label="Pretraga proizvoda"
        className="h-10 pl-9"
      />
    </div>
  );
}

export function Header() {
  const emailHref = `mailto:${EMAIL}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Lijeva grupa: logo + navigacija — drže se zajedno kao jedna cjelina umjesto da nav
            "pluta" u sredini (korisnički feedback 23.08.2026: header djeluje zbijeno/nesmisleno
            grupisan). */}
        <div className="flex min-w-0 items-center gap-10 lg:gap-14">
          {/* Logo — <img>, ne CSS background. PNG sa providnom pozadinom (chroma-key na originalnoj
              cream pozadini loga) umjesto ranije WebP verzije — WebP je imao vidljiv opaque kvadrat
              koji je "isplivao" preko sadržaja pri skrolu zbog header-ovog backdrop-blur efekta
              (korisnički feedback 23.08.2026). Razmak logo↔nav povećan (gap-8 → gap-10/14) po istom
              feedbacku ("meni je preblizu logu"). */}
          <Link href="/" className="flex shrink-0 items-center">
            <img src="/logo-header.png" alt="Aurelia posteljina" className="h-9 w-auto md:h-10" />
          </Link>

          <nav aria-label="Glavna navigacija" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {NAVIGACIJA.map((stavka) => (
                <li key={stavka.href}>
                  <Link
                    href={stavka.href}
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {stavka.naziv}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Desna grupa: pretraga + telefon + korpa (+ mobilni meni) — jedna vizuelna cjelina s
            razumnim razmakom, umjesto telefona izolovanog sasvim desno (korisnički feedback:
            "pretrazi... treba da bude pomjereno uz broj"). Pretraga suzena sa flex-1 na fiksnu
            širinu da ne razvlači sredinu headera. */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <PretragaPolje className="relative hidden w-40 lg:block xl:w-56" />

          {/* Email — ikona-only od mobilnog do lg, puni tekst tek od lg naviše kad ima mjesta uz
              pretragu (isti raspored kao ranije telefonsko dugme, samo zamijenjen kanal). */}
          <a
            href={emailHref}
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label={`Pošaljite email na ${EMAIL}`}
          >
            <Mail className="size-5" aria-hidden="true" />
          </a>

          <a
            href={emailHref}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:inline-flex"
          >
            <Mail className="size-4" aria-hidden="true" />
            {EMAIL}
          </a>

          <KorpaIkonica />

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Otvori meni"
                />
              }
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Meni</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobilna navigacija" className="flex flex-col gap-1 px-4">
                {NAVIGACIJA.map((stavka) => (
                  <SheetClose
                    key={stavka.href}
                    render={
                      <Link
                        href={stavka.href}
                        className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                      />
                    }
                  >
                    {stavka.naziv}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t border-border px-4 py-4">
                <PretragaPolje className="relative mb-3" />
                <a
                  href={emailHref}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {EMAIL}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
