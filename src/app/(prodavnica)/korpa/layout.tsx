// Layout samo radi `metadata` exporta — /korpa/page.tsx mora biti "use client" u cijelosti (cart
// state odlučuje prazno/puno stanje odmah pri renderu), a client komponente ne mogu eksportovati
// metadata. Transakciona stranica (korpa) je namjerno noindex — nema SEO vrijednost, izbjegava se
// da se indeksira prazna/promjenjiva korpa.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Korpa | Aurelia.ba",
  robots: { index: false, follow: false },
};

export default function KorpaLayout({ children }: { children: ReactNode }) {
  return children;
}
