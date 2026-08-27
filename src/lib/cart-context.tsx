"use client";

// Cart infrastruktura (client-side, React context + localStorage) — CLAUDE_aurelia.md /
// aurelia-frontend.md §"Cart / checkout": "Gradiš funkcionalan cart (client-side, npr. React
// context + localStorage)". Ovo je osnova za Header korpa-ikonicu i "Dodaj u korpu" dugme na
// KarticaProizvoda — checkout stranica (pouzeće / bankovni transfer / pay-by-link TODO) gradi se
// u kasnijem koraku, ovaj context samo drži stanje korpe.
//
// NAPOMENA za sljedeći korak (homepage/shop stranice): <CartProvider> još NIJE ukačen u
// src/app/layout.tsx (namjerno — orkestrator je tražio da se layout.tsx ne dira u ovom koraku).
// Kad se stranice grade, root layout treba omotati children sa <CartProvider>, npr.:
//   <CartProvider><Header />{children}<Footer /></CartProvider>

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import type { Proizvod } from "@/lib/products";

export type StavkaKorpe = {
  proizvod: Proizvod;
  dimenzija?: string;
  kolicina: number;
};

type CartContextValue = {
  items: StavkaKorpe[];
  addItem: (proizvod: Proizvod, dimenzija?: string, kolicina?: number) => void;
  removeItem: (slug: string, dimenzija?: string) => void;
  updateQuantity: (slug: string, dimenzija: string | undefined, kolicina: number) => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "aurelia-korpa";

// Identitet stavke u korpi = slug proizvoda + izabrana dimenzija (isti proizvod u različitim
// dimenzijama su odvojene stavke).
function stavkaKljuc(slug: string, dimenzija?: string): string {
  return `${slug}__${dimenzija ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<StavkaKorpe[]>([]);
  const [hidratisano, setHidratisano] = useState(false);

  // Učitaj sačuvanu korpu nakon mount-a. `window` ne postoji tokom SSR-a, pa se ovo mora desiti
  // u efektu (klijent), ne u render tijelu — namjerno, uprkos "set-state-in-effect" dijagnostici
  // iz eslint-plugin-react-hooks (React Compiler analiza, ne obična eslint-disable-suzbijena
  // pravila): localStorage nije dostupan tokom rendera (ni SSR ni prvog klijentskog rendera prije
  // hidratacije), pa se ne može pročitati kroz lazy useState initializer bez hydration mismatch-a
  // (server bi renderovao praznu korpu, klijent odmah punu). Ovo je standardan SSR-safe obrazac za
  // hidraciju stanja iz localStorage — setItems se poziva tačno jednom, na mount, ne u petlji.
  useEffect(() => {
    try {
      const sacuvano = window.localStorage.getItem(STORAGE_KEY);
      if (sacuvano) {
        setItems(JSON.parse(sacuvano) as StavkaKorpe[]);
      }
    } catch {
      // Korumpiran JSON ili nedostupan localStorage (privatni mod) — nastavi s praznom korpom.
    } finally {
      setHidratisano(true);
    }
  }, []);

  // Sačuvaj u localStorage na svaku promjenu, ali tek nakon inicijalnog učitavanja — inače bi
  // prvi render (prazna korpa) obrisao ono što je već sačuvano prije nego što stigne da se učita.
  useEffect(() => {
    if (!hidratisano) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Puna kvota / privatni mod — korpa i dalje radi u memoriji za trajanje sesije.
    }
  }, [items, hidratisano]);

  const addItem = useCallback(
    (proizvod: Proizvod, dimenzija?: string, kolicina = 1) => {
      setItems((prev) => {
        const kljuc = stavkaKljuc(proizvod.slug, dimenzija);
        const postoji = prev.some(
          (stavka) => stavkaKljuc(stavka.proizvod.slug, stavka.dimenzija) === kljuc
        );
        if (postoji) {
          return prev.map((stavka) =>
            stavkaKljuc(stavka.proizvod.slug, stavka.dimenzija) === kljuc
              ? { ...stavka, kolicina: stavka.kolicina + kolicina }
              : stavka
          );
        }
        return [...prev, { proizvod, dimenzija, kolicina }];
      });

      // Jedino mjesto koje okida "dodano u korpu" povratnu informaciju — i KarticaProizvoda i
      // DodajUKorpu (proizvodna stranica) zovu ovu istu funkciju, pa toast pokriva oba mjesta bez
      // dupliranja logike (korisnički feedback 27.08.2026: klik na dugme nije davao nikakvu
      // vidljivu potvrdu osim promjene brojčice na ikonici korpe u headeru).
      toast(`Dodano u korpu: ${proizvod.naziv}`, {
        action: {
          label: "Vidi korpu",
          onClick: () => router.push("/korpa/"),
        },
      });
    },
    [router]
  );

  const removeItem = useCallback((slug: string, dimenzija?: string) => {
    const kljuc = stavkaKljuc(slug, dimenzija);
    setItems((prev) =>
      prev.filter((stavka) => stavkaKljuc(stavka.proizvod.slug, stavka.dimenzija) !== kljuc)
    );
  }, []);

  const updateQuantity = useCallback(
    (slug: string, dimenzija: string | undefined, kolicina: number) => {
      const kljuc = stavkaKljuc(slug, dimenzija);
      setItems((prev) => {
        if (kolicina <= 0) {
          return prev.filter(
            (stavka) => stavkaKljuc(stavka.proizvod.slug, stavka.dimenzija) !== kljuc
          );
        }
        return prev.map((stavka) =>
          stavkaKljuc(stavka.proizvod.slug, stavka.dimenzija) === kljuc
            ? { ...stavka, kolicina }
            : stavka
        );
      });
    },
    []
  );

  const totalCount = useMemo(
    () => items.reduce((zbir, stavka) => zbir + stavka.kolicina, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((zbir, stavka) => zbir + stavka.proizvod.cijena * stavka.kolicina, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, totalCount, totalPrice }),
    [items, addItem, removeItem, updateQuantity, totalCount, totalPrice]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Prati brend tokene iz globals.css (isti obrazac kao Button/Badge) umjesto sonner-ovog
          default izgleda — vidi CSS custom properties koje sonner čita za temu. */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          actionButtonStyle: {
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          },
        }}
      />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart mora biti pozvan unutar <CartProvider>.");
  }
  return context;
}
