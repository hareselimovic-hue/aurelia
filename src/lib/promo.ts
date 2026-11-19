// Promo kodovi (korisnik, 19.11.2026). Popust se računa SAMO na proizvode, ne na dostavu.
// Dvije vrste kodova:
//  1. OPSTI_KODOVI ispod — ručno upisani, važe neograničeno puta (npr. za Instagram objavu).
//  2. Jednokratni kodovi iz popupa (tabela PromoKod) — jedan po emailu, važi jednom.
// Samo za server (uvoze ga /api/promo, /api/narudzbe, /api/popust-prijava) — ne uvoziti u
// "use client" komponente, inače opšti kodovi završe u javnom JS bundle-u.

import { randomInt } from "node:crypto";

import { prisma } from "@/lib/prisma";

// Novi opšti kod = nova linija (ključ VELIKIM slovima, vrijednost = procenat). Brisanje linije gasi kod.
const OPSTI_KODOVI: Record<string, number> = {
  AURELIA10: 10,
};

export const POPUP_PROCENAT = 10;

export function normalizujKod(kod: string): string {
  return kod.trim().toUpperCase();
}

export type ProvjeraKoda =
  | { ok: true; kod: string; procenat: number; jednokratni: boolean }
  | { ok: false; greska: string };

/** Provjera koda (bez trošenja). Velika/mala slova nisu bitna. */
export async function provjeriKod(unos: string): Promise<ProvjeraKoda> {
  const kod = normalizujKod(unos);
  if (!kod) return { ok: false, greska: "Unesite promo kod." };

  const opsti = OPSTI_KODOVI[kod];
  if (opsti !== undefined) return { ok: true, kod, procenat: opsti, jednokratni: false };

  const zapis = await prisma.promoKod.findUnique({ where: { kod } });
  if (!zapis) return { ok: false, greska: "Promo kod nije važeći." };
  if (zapis.iskoristenAt) return { ok: false, greska: "Ovaj promo kod je već iskorišten." };
  return { ok: true, kod, procenat: zapis.procenat, jednokratni: true };
}

/**
 * Atomski "troši" jednokratni kod — uslov `iskoristenAt: null` u istom UPDATE-u sprječava da dvije
 * istovremene narudžbe iskoriste isti kod. Vraća false ako je kod u međuvremenu iskorišten.
 */
export async function iskoristiKod(kod: string, brojNarudzbe: string): Promise<boolean> {
  const { count } = await prisma.promoKod.updateMany({
    where: { kod, iskoristenAt: null },
    data: { iskoristenAt: new Date(), brojNarudzbe },
  });
  return count === 1;
}

// Bez 0/O/1/I/L da se kod ne pogriješi pri prepisivanju.
const ABECEDA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generisiKod(): string {
  let dio = "";
  for (let i = 0; i < 6; i++) dio += ABECEDA[randomInt(ABECEDA.length)];
  return `AUR-${dio}`;
}

/** Iznos popusta u KM, zaokružen na 2 decimale. */
export function izracunajPopust(iznosStavki: number, procenat: number): number {
  return Math.round(iznosStavki * procenat) / 100;
}
