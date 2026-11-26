// Program preporuka (korisnik, 26.11.2026) — samo server. Pravila u src/lib/preporuke-konstante.ts.

import { randomInt } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { PREPORUKA_MAKS_PRIJATELJA } from "@/lib/preporuke-konstante";

const ABECEDA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** "Amra Selimović" → "AMRA". Bez dijakritike, samo slova, najviše 8 znakova. */
function osnovaIzImena(imePrezime: string): string {
  const ime = imePrezime.trim().split(/\s+/)[0] ?? "";
  const cisto = ime
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "DJ")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8);
  return cisto || "AURELIA";
}

/** Ime za prikaz prijatelju ("Amra"), iz punog imena. */
export function imeZaPrikaz(imePrezime: string): string {
  const ime = imePrezime.trim().split(/\s+/)[0] ?? "";
  return ime ? ime.charAt(0).toUpperCase() + ime.slice(1).toLowerCase() : "Vaš prijatelj";
}

/** Lični kod preporuke za email (postojeći ili nov, npr. "AMRA-7K2"). */
export async function dodijeliPreporuku(email: string, imePrezime: string): Promise<string> {
  const emailMali = email.trim().toLowerCase();
  const postojeca = await prisma.preporuka.findUnique({ where: { email: emailMali } });
  if (postojeca) return postojeca.kod;

  const osnova = osnovaIzImena(imePrezime);
  for (let pokusaj = 0; pokusaj < 8; pokusaj++) {
    let dio = "";
    for (let i = 0; i < 3; i++) dio += ABECEDA[randomInt(ABECEDA.length)];
    try {
      const nova = await prisma.preporuka.create({
        data: { kod: `${osnova}-${dio}`, email: emailMali, ime: imeZaPrikaz(imePrezime) },
      });
      return nova.kod;
    } catch {
      // kolizija koda ili istovremeno kreiranje za isti email → provjeri ponovo
      const vec = await prisma.preporuka.findUnique({ where: { email: emailMali } });
      if (vec) return vec.kod;
    }
  }
  throw new Error(`Kod preporuke za ${emailMali} nije kreiran.`);
}

const samoCifre = (t: string) => t.replace(/\D/g, "").replace(/^(00387|387)/, "0");

/**
 * Prijatelj smije iskoristiti kod preporuke samo ako je NOVI kupac (ni email ni telefon nisu u
 * ranijim narudžbama), nije sam kupac koji je poslao link, i ako kupac još nema 3 prijatelja.
 */
export async function provjeriPrijatelja(opts: {
  kod: string;
  emailPreporucitelja: string;
  email: string;
  telefon: string;
}): Promise<{ ok: true } | { ok: false; greska: string }> {
  const email = opts.email.trim().toLowerCase();
  if (email === opts.emailPreporucitelja.toLowerCase()) {
    return { ok: false, greska: "Svoj kod preporuke ne možete koristiti sami — pošaljite ga prijatelju." };
  }

  const telefon = samoCifre(opts.telefon);
  const ranije = await prisma.narudzba.findMany({
    where: { OR: [{ email: { equals: email, mode: "insensitive" } }, { telefon: { contains: telefon.slice(-6) } }] },
    select: { email: true, telefon: true },
  });
  const vecKupac = ranije.some(
    (n) => n.email.toLowerCase() === email || (telefon.length >= 6 && samoCifre(n.telefon) === telefon),
  );
  if (vecKupac) {
    return { ok: false, greska: "Kod preporuke važi samo za prvu narudžbu." };
  }

  const iskoristeno = await prisma.preporukaKoristenje.count({
    where: { preporukaKod: opts.kod, ponistenoAt: null },
  });
  if (iskoristeno >= PREPORUKA_MAKS_PRIJATELJA) {
    return { ok: false, greska: "Ovaj kod preporuke je već iskorišten maksimalan broj puta." };
  }
  return { ok: true };
}
