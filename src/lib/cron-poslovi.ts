// Dnevni automatski mailovi (pokreće ih /api/cron/dnevno/ jednom dnevno, Vercel Cron 09:00 UTC).
//  1. Podsjetnik za neiskorišten promo kod (24.11.2026) — kod star 2–14 dana, jednom.
//  2. Mail nakon isporuke (26.11.2026) — 4–30 dana nakon "poslano": recenzija + link za prijatelje.
//  3. Nagrada za preporuku (26.11.2026) — prijateljeva narudžba "poslano" 7+ dana i nije vraćena →
//     kupcu koji je poslao link novi kod (60 dana) i poseban mail za svakog prijatelja.
// Svaki posao prvo atomski "zauzme" red (updateMany ... where null), pa dva pokretanja ne šalju duplo.

import { randomBytes } from "node:crypto";

import {
  posaljiMailNakonIsporuke,
  posaljiNagraduPreporuke,
  posaljiPodsjetnikKoda,
} from "@/app/api/narudzbe/email";
import { prisma } from "@/lib/prisma";
import { generisiKod } from "@/lib/promo";
import { dodijeliPreporuku, imeZaPrikaz } from "@/lib/preporuke";
import {
  MAIL_NAKON_SLANJA_DANA,
  PREPORUKA_CEKANJE_DANA,
  PREPORUKA_MAKS_PRIJATELJA,
  PREPORUKA_NAGRADA_DANA,
  PREPORUKA_PROCENAT,
  linkPodijeli,
  linkPreporuke,
} from "@/lib/preporuke-konstante";

const DAN_MS = 24 * 60 * 60 * 1000;
const NAJVISE = 100;

type Rezultat = { kandidata: number; poslano: number; preskoceno: number; neuspjelo: number };

export async function podsjetniciKodova(): Promise<Rezultat> {
  const sada = Date.now();
  const kandidati = await prisma.promoKod.findMany({
    where: {
      iskoristenAt: null,
      podsjetnikPoslanAt: null,
      createdAt: { lte: new Date(sada - 2 * DAN_MS), gte: new Date(sada - 14 * DAN_MS) },
    },
    orderBy: { createdAt: "asc" },
    take: NAJVISE,
  });

  const r: Rezultat = { kandidata: kandidati.length, poslano: 0, preskoceno: 0, neuspjelo: 0 };
  for (const k of kandidati) {
    if (k.vaziDo && k.vaziDo < new Date()) continue;
    const naruceno = await prisma.narudzba.findFirst({
      where: { email: { equals: k.email, mode: "insensitive" }, createdAt: { gte: k.createdAt } },
      select: { id: true },
    });
    const zauzeto = await prisma.promoKod.updateMany({
      where: { kod: k.kod, podsjetnikPoslanAt: null, iskoristenAt: null },
      data: { podsjetnikPoslanAt: new Date() },
    });
    if (zauzeto.count === 0) continue;
    if (naruceno) {
      r.preskoceno++;
      continue;
    }
    if (await posaljiPodsjetnikKoda({ email: k.email, kod: k.kod, procenat: k.procenat })) {
      r.poslano++;
    } else {
      r.neuspjelo++;
      await prisma.promoKod.update({ where: { kod: k.kod }, data: { podsjetnikPoslanAt: null } });
    }
  }
  return r;
}

export async function mailoviNakonIsporuke(): Promise<Rezultat> {
  const sada = Date.now();
  const kandidati = await prisma.narudzba.findMany({
    where: {
      status: "poslano",
      recenzijaMailAt: null,
      poslanoAt: {
        lte: new Date(sada - MAIL_NAKON_SLANJA_DANA * DAN_MS),
        gte: new Date(sada - 30 * DAN_MS),
      },
    },
    orderBy: { poslanoAt: "asc" },
    take: NAJVISE,
  });

  const r: Rezultat = { kandidata: kandidati.length, poslano: 0, preskoceno: 0, neuspjelo: 0 };
  for (const n of kandidati) {
    const token = n.recenzijaToken ?? randomBytes(18).toString("base64url");
    const zauzeto = await prisma.narudzba.updateMany({
      where: { id: n.id, recenzijaMailAt: null, status: "poslano" },
      data: { recenzijaMailAt: new Date(), recenzijaToken: token },
    });
    if (zauzeto.count === 0) continue;

    const kod = await dodijeliPreporuku(n.email, n.imePrezime);
    const ok = await posaljiMailNakonIsporuke({
      email: n.email,
      ime: imeZaPrikaz(n.imePrezime),
      linkRecenzije: `https://aurelia.ba/recenzija/${token}/`,
      linkPreporuke: linkPreporuke(kod),
      linkPodijeli: linkPodijeli(kod),
      procenat: PREPORUKA_PROCENAT,
      maksPrijatelja: PREPORUKA_MAKS_PRIJATELJA,
    });
    if (ok) {
      r.poslano++;
    } else {
      r.neuspjelo++;
      await prisma.narudzba.update({ where: { id: n.id }, data: { recenzijaMailAt: null } });
    }
  }
  return r;
}

export async function nagradeZaPreporuke(): Promise<Rezultat> {
  const prag = new Date(Date.now() - PREPORUKA_CEKANJE_DANA * DAN_MS);
  const otvorena = await prisma.preporukaKoristenje.findMany({
    where: { nagradaKod: null, ponistenoAt: null },
    orderBy: { createdAt: "asc" },
    take: NAJVISE,
  });

  const r: Rezultat = { kandidata: 0, poslano: 0, preskoceno: 0, neuspjelo: 0 };
  for (const k of otvorena) {
    const narudzba = await prisma.narudzba.findUnique({ where: { brojNarudzbe: k.brojNarudzbe } });
    if (!narudzba || narudzba.status !== "poslano" || !narudzba.poslanoAt || narudzba.poslanoAt > prag) {
      continue;
    }
    r.kandidata++;
    const preporuka = await prisma.preporuka.findUnique({ where: { kod: k.preporukaKod } });
    if (!preporuka) {
      r.preskoceno++;
      continue;
    }

    const kod = generisiKod();
    const zauzeto = await prisma.preporukaKoristenje.updateMany({
      where: { id: k.id, nagradaKod: null, ponistenoAt: null },
      data: { nagradaKod: kod },
    });
    if (zauzeto.count === 0) continue;

    const vaziDo = new Date(Date.now() + PREPORUKA_NAGRADA_DANA * DAN_MS);
    await prisma.promoKod.create({
      data: {
        kod,
        email: preporuka.email,
        procenat: PREPORUKA_PROCENAT,
        vrsta: "preporuka",
        vaziDo,
      },
    });
    const redniBroj = await prisma.preporukaKoristenje.count({
      where: { preporukaKod: k.preporukaKod, nagradaKod: { not: null }, ponistenoAt: null },
    });

    const ok = await posaljiNagraduPreporuke({
      email: preporuka.email,
      kod,
      procenat: PREPORUKA_PROCENAT,
      imePrijatelja: imeZaPrikaz(narudzba.imePrezime),
      redniBroj,
      maksPrijatelja: PREPORUKA_MAKS_PRIJATELJA,
      vaziDo,
    });
    if (ok) {
      r.poslano++;
      await prisma.preporukaKoristenje.update({
        where: { id: k.id },
        data: { nagradaPoslanaAt: new Date() },
      });
    } else {
      // Kod ostaje važeći u bazi (vidljiv u adminu); mail se ne ponavlja automatski.
      r.neuspjelo++;
    }
  }
  return r;
}
