// Čista logika agregacije za admin dashboard (korisnik, 10.10.2026) — odvojeno od page.tsx da se
// može nezavisno čitati/testirati, isti obrazac kao src/lib/zaliha.ts. Bez pristupa bazi ovdje;
// stranica dovuče narudžbe/zalihu preko Prisma-e i proslijedi već-učitane podatke ovim funkcijama.

import type { NarudzbaStavka } from "@/app/api/narudzbe/types";
import type { Proizvod } from "@/lib/products";

export type MjesecnaStatistika = {
  mjesec: string; // "2026-10", sortirajući ključ
  naziv: string; // "Oktobar 2026", za prikaz
  brojNarudzbi: number;
  ukupnaCijena: number;
};

const NAZIVI_MJESECI = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

/** Grupiše narudžbe po mjesecu (kalendarski, po createdAt), najnoviji mjesec prvi. Računa SVE
 * narudžbe bez obzira na status (nova/poslano) — narudžba je "stvarna" čim je kreirana, ne tek
 * kad se pošalje. */
export function grupisiPoMjesecima(
  narudzbe: { createdAt: Date; ukupnaCijena: number }[]
): MjesecnaStatistika[] {
  const mapa = new Map<string, MjesecnaStatistika>();

  for (const n of narudzbe) {
    const godina = n.createdAt.getFullYear();
    const mjesecIndeks = n.createdAt.getMonth();
    const kljuc = `${godina}-${String(mjesecIndeks + 1).padStart(2, "0")}`;

    const postojeci = mapa.get(kljuc);
    if (postojeci) {
      postojeci.brojNarudzbi += 1;
      postojeci.ukupnaCijena += n.ukupnaCijena;
    } else {
      mapa.set(kljuc, {
        mjesec: kljuc,
        naziv: `${NAZIVI_MJESECI[mjesecIndeks]} ${godina}`,
        brojNarudzbi: 1,
        ukupnaCijena: n.ukupnaCijena,
      });
    }
  }

  return Array.from(mapa.values()).sort((a, b) => (a.mjesec < b.mjesec ? 1 : -1));
}

export type BestsellerStavka = {
  slug: string;
  naziv: string;
  kolicina: number;
};

/** Zbraja prodanu količinu po slugu preko svih narudžbi. Koristi `naziv` ZAMRZNUT u stavci
 * narudžbe (ne trenutni naziv iz products.ts) — radi ispravno i ako je proizvod kasnije
 * preimenovan/uklonjen iz kataloga, isti princip kao zamrznuta cijena (schema.prisma napomena). */
export function izracunajBestsellere(
  sveStavke: NarudzbaStavka[][],
  limit = 5
): BestsellerStavka[] {
  const mapa = new Map<string, BestsellerStavka>();

  for (const stavke of sveStavke) {
    for (const stavka of stavke) {
      const postojeci = mapa.get(stavka.slug);
      if (postojeci) {
        postojeci.kolicina += stavka.kolicina;
      } else {
        mapa.set(stavka.slug, { slug: stavka.slug, naziv: stavka.naziv, kolicina: stavka.kolicina });
      }
    }
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.kolicina - a.kolicina)
    .slice(0, limit);
}

export type NiskaZalihaStavka = {
  slug: string;
  naziv: string;
  kolicina: number;
};

/** Prag za "nisku zalihu" upozorenje na dashboardu — proizvoljna, lako promjenjiva vrijednost. */
export const NISKA_ZALIHA_PRAG = 5;

/** Proizvodi na/ispod praga. "Puni set" proizvodi (imaju `komponente`) se namjerno izostavljaju —
 * oni nemaju vlastiti red u zalihi (src/lib/zaliha.ts razlaže ih na komponente), pa bi uvijek
 * pokazivali lažnih "0 na stanju". */
export function pronadjiNiskuZalihu(
  proizvodi: Proizvod[],
  kolicinaPoSlugu: Map<string, number>
): NiskaZalihaStavka[] {
  return proizvodi
    .filter((p) => !p.komponente || p.komponente.length === 0)
    .map((p) => ({ slug: p.slug, naziv: p.naziv, kolicina: kolicinaPoSlugu.get(p.slug) ?? 0 }))
    .filter((p) => p.kolicina <= NISKA_ZALIHA_PRAG)
    .sort((a, b) => a.kolicina - b.kolicina);
}
