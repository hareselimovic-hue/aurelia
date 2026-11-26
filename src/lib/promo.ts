// Promo kodovi (korisnik, 19.11.2026). Popust se računa SAMO na proizvode, ne na dostavu.
// Dvije vrste kodova:
//  1. OPSTI_KODOVI ispod — ručno upisani, važe neograničeno puta (npr. za Instagram objavu).
//  2. Jednokratni kodovi (tabela PromoKod) — iz popupa/nagradne igre (jedan po emailu) i nagrade
//     za preporuku (vrsta "preporuka", rok 60 dana). Važe jednom.
//  3. Kodovi preporuke (tabela Preporuka, src/lib/preporuke.ts) — lični kod kupca, 10% za prijatelja
//     na PRVU narudžbu; uslov "novi kupac" se provjerava tek u /api/narudzbe (tamo su email/telefon).
// Samo za server (uvoze ga /api/promo, /api/narudzbe, /api/popust-prijava) — ne uvoziti u
// "use client" komponente, inače opšti kodovi završe u javnom JS bundle-u.

import { randomInt } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { PREPORUKA_PROCENAT } from "@/lib/preporuke-konstante";

// Novi opšti kod = nova linija (ključ VELIKIM slovima, vrijednost = procenat). Brisanje linije gasi kod.
const OPSTI_KODOVI: Record<string, number> = {
  AURELIA10: 10,
};

export const POPUP_PROCENAT = 10;

export function normalizujKod(kod: string): string {
  return kod.trim().toUpperCase();
}

export type ProvjeraKoda =
  | {
      ok: true;
      kod: string;
      procenat: number;
      jednokratni: boolean;
      /** Postavljeno samo za kod preporuke — email i ime kupca koji je poslao link. */
      preporuka?: { email: string; ime: string };
    }
  | { ok: false; greska: string };

/** Provjera koda (bez trošenja). Velika/mala slova nisu bitna. */
export async function provjeriKod(unos: string): Promise<ProvjeraKoda> {
  const kod = normalizujKod(unos);
  if (!kod) return { ok: false, greska: "Unesite promo kod." };

  const opsti = OPSTI_KODOVI[kod];
  if (opsti !== undefined)
    return { ok: true, kod, procenat: opsti, jednokratni: false };

  const zapis = await prisma.promoKod.findUnique({ where: { kod } });
  if (zapis) {
    if (zapis.iskoristenAt)
      return { ok: false, greska: "Ovaj promo kod je već iskorišten." };
    if (zapis.vaziDo && zapis.vaziDo < new Date())
      return { ok: false, greska: "Ovaj promo kod je istekao." };
    return { ok: true, kod, procenat: zapis.procenat, jednokratni: true };
  }

  const preporuka = await prisma.preporuka.findUnique({ where: { kod } });
  if (preporuka) {
    return {
      ok: true,
      kod,
      procenat: PREPORUKA_PROCENAT,
      jednokratni: false,
      preporuka: { email: preporuka.email, ime: preporuka.ime },
    };
  }

  return { ok: false, greska: "Promo kod nije važeći." };
}

/**
 * Atomski "troši" jednokratni kod — uslov `iskoristenAt: null` u istom UPDATE-u sprječava da dvije
 * istovremene narudžbe iskoriste isti kod. Vraća false ako je kod u međuvremenu iskorišten.
 */
export async function iskoristiKod(
  kod: string,
  brojNarudzbe: string,
): Promise<boolean> {
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

export type DodjelaKoda =
  | { status: "nov" | "postojeci"; kod: string }
  | { status: "iskoristen" }
  | { status: "greska" };

/**
 * Jedan jednokratni kod po emailu (popup i nagradna igra dijele ovo). Isti email → isti
 * neiskorišteni kod; ako je email već iskoristio kod, novi se ne daje.
 */
export async function dodijeliKodZaEmail(email: string): Promise<DodjelaKoda> {
  // Samo popup/nagradna kodovi — nagrade za preporuku ne utiču na popup popust.
  const postojeci = await prisma.promoKod.findMany({ where: { email, vrsta: "popup" } });
  if (postojeci.some((k) => k.iskoristenAt)) return { status: "iskoristen" };
  if (postojeci[0]) return { status: "postojeci", kod: postojeci[0].kod };

  // Kolizija 6 nasumičnih znakova (31^6 ≈ 887 mil.) je praktično nemoguća, ali ipak par pokušaja.
  for (let pokusaj = 0; pokusaj < 5; pokusaj++) {
    const kandidat = generisiKod();
    try {
      await prisma.promoKod.create({
        data: { kod: kandidat, email, procenat: POPUP_PROCENAT },
      });
      return { status: "nov", kod: kandidat };
    } catch {
      // duplikat ključa → novi pokušaj
    }
  }
  return { status: "greska" };
}

/** Iznos popusta u KM, zaokružen na 2 decimale. */
export function izracunajPopust(iznosStavki: number, procenat: number): number {
  return Math.round(iznosStavki * procenat) / 100;
}
