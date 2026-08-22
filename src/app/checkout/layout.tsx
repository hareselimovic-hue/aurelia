// Isti razlog kao src/app/korpa/layout.tsx: /checkout/page.tsx mora biti "use client" (forma +
// cart state + potvrda narudžbe sve žive u klijentskom state-u), pa metadata ide u ovaj nadređeni
// server layout. Transakciona stranica — noindex.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Plaćanje | Aurelia.ba",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
