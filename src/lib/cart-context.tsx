"use client";

// Cart infrastruktura (client-side, React context + localStorage) — CLAUDE_aurelia.md /
// aurelia-frontend.md §"Cart / checkout": "Gradiš funkcionalan cart (client-side, npr. React
// context + localStorage)". Ovo je osnova za Header korpa-ikonicu i "Dodaj u korpu" dugme na
// KarticaProizvoda — checkout stranica (pouzeće / bankovni transfer / pay-by-link TODO) gradi se
// u kasnijem koraku, ovaj context samo drži stanje korpe.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Proizvod } from "@/lib/products";
import { KorpaDrawer } from "@/components/cart/korpa-drawer";

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
  drawerOtvoren: boolean;
  setDrawerOtvoren: (otvoren: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "aurelia-korpa";

// Identitet stavke u korpi = slug proizvoda + izabrana dimenzija (isti proizvod u različitim
// dimenzijama su odvojene stavke).
function stavkaKljuc(slug: string, dimenzija?: string): string {
  return `${slug}__${dimenzija ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StavkaKorpe[]>([]);
  const [hidratisano, setHidratisano] = useState(false);
  // Otvara se automatski iz addItem (korisnički feedback 27.08.2026: umjesto toast notifikacije,
  // slide-out panel zdesna sa sadržajem korpe i "Nastavi kupovinu"/"Nastavi plaćanje" dugmadima —
  // vidi src/components/cart/korpa-drawer.tsx).
  const [drawerOtvoren, setDrawerOtvoren] = useState(false);

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

  const addItem = useCallback((proizvod: Proizvod, dimenzija?: string, kolicina = 1) => {
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
    // DodajUKorpu (proizvodna stranica) zovu ovu istu funkciju, pa drawer pokriva oba mjesta bez
    // dupliranja logike.
    setDrawerOtvoren(true);
  }, []);

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
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      totalCount,
      totalPrice,
      drawerOtvoren,
      setDrawerOtvoren,
    }),
    [items, addItem, removeItem, updateQuantity, totalCount, totalPrice, drawerOtvoren]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <KorpaDrawer />
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
