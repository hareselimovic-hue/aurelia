"use client";

// Header (dijeljena komponenta) — CLAUDE_aurelia.md §4-01:
// "Logo (link na `/`) · navigacija · pretraga · korpa · telefon."
// - Navigacija maksimalno 5 stavki
// - Logo je <img> sa alt="[Brend] posteljina", NE CSS background
// - Telefon na mobilnom kao tel: link

import Link from "next/link";
import { Menu, Phone, Search, ShoppingBag } from "lucide-react";

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

// TODO copy: aurelia-copywriter / korisnik — telefon je placeholder dok se ne potvrdi stvarni broj.
const TELEFON = "+387 60 000 000";

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
  const telefonHref = `tel:${TELEFON.replace(/\s/g, "")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo — <img>, ne CSS background */}
        <Link href="/" className="flex shrink-0 items-center">
          <img src="/logo.svg" alt="Aurelia posteljina" className="h-8 w-auto" />
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

        <PretragaPolje className="relative hidden max-w-xs flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1">
          {/* Telefon na mobilnom kao tel: link (CLAUDE_aurelia.md §4-01) */}
          <a
            href={telefonHref}
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={`Pozovi ${TELEFON}`}
          >
            <Phone className="size-5" aria-hidden="true" />
          </a>

          <a
            href={telefonHref}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {TELEFON}
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
                  href={telefonHref}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {TELEFON}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
