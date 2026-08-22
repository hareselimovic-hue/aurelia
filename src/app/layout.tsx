import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Tijelo teksta: topla, čitljiva humanistička grotesk — nosi UI, cijene, opise.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"], // latin-ext obavezan zbog č/ć/š/ž/đ
  weight: ["400", "500", "700"],
  display: "swap",
});

// Naslovi: mekan, topao serif (ne hladan/geometrijski) — nosi h1-h3, brend osjećaj.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Zadržan samo za eventualnu upotrebu monospace (kod, tabele brojeva) — brend ga ne koristi u UI.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fallback samo — svaka ruta definiše svoj metadata export (CLAUDE_aurelia.md §11: "Meta podaci se
// definišu po ruti, ne globalno").
export const metadata: Metadata = {
  title: "Aurelia — posteljina",
  description: "Aurelia — online prodaja posteljine u BiH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bs"
      className={`${dmSans.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
