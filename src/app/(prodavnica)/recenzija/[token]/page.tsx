// /recenzija/[token]/ (korisnik, 26.11.2026) — kupac stiže iz maila nakon isporuke. Token je vezan za
// stvarnu narudžbu, pa recenziju ne može ostaviti neko ko nije kupio. Jedna ocjena po proizvodu.
// Nakon slanja (ili ako je već poslao) vidi svoj link za prijatelje.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { NarudzbaStavka } from "@/app/api/narudzbe/types";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products";
import { dodijeliPreporuku, imeZaPrikaz } from "@/lib/preporuke";
import {
  PREPORUKA_MAKS_PRIJATELJA,
  PREPORUKA_PROCENAT,
  linkPreporuke,
} from "@/lib/preporuke-konstante";

import { RecenzijaForma } from "./forma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vaša recenzija | Aurelia.ba",
  robots: { index: false, follow: false },
};

/** "Amra Selimović" + "Sarajevo" → "Amra S., Sarajevo". */
function predlozenoIme(imePrezime: string, grad: string): string {
  const dijelovi = imePrezime.trim().split(/\s+/);
  const ime = imeZaPrikaz(imePrezime);
  const inicijal = dijelovi[1] ? ` ${dijelovi[1].charAt(0).toUpperCase()}.` : "";
  return `${ime}${inicijal}${grad.trim() ? `, ${grad.trim()}` : ""}`;
}

export default async function RecenzijaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const narudzba = await prisma.narudzba.findUnique({ where: { recenzijaToken: token } });
  if (!narudzba || narudzba.status === "vraceno") notFound();

  const stavke = narudzba.stavke as unknown as NarudzbaStavka[];
  const vidjeno = new Set<string>();
  const proizvodi = stavke
    .filter((s) => (vidjeno.has(s.slug) ? false : (vidjeno.add(s.slug), true)))
    .map((s) => {
      const p = getProductBySlug(s.slug);
      return { slug: s.slug, naziv: p?.naziv ?? s.naziv, slika: p?.slike[0]?.url ?? null };
    });

  const vecOcijenjeno = await prisma.recenzija.findMany({
    where: { brojNarudzbe: narudzba.brojNarudzbe },
    select: { slug: true },
  });
  const kodPreporuke = await dodijeliPreporuku(narudzba.email, narudzba.imePrezime);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:py-20">
      <p className="text-eyebrow text-primary">Narudžba {narudzba.brojNarudzbe}</p>
      <h1 className="mt-3">Nadamo se da ste zadovoljni</h1>
      <p className="mt-4 text-muted-foreground">
        Ocijenite svaki proizvod koji ste kupili — recenzija ide na stranicu tog proizvoda i pomaže
        drugim kupcima da odaberu. Prikazuje se
        na stranici proizvoda uz oznaku &bdquo;Provjerena kupovina&rdquo;.
      </p>

      <RecenzijaForma
        token={token}
        proizvodi={proizvodi}
        predlozenoIme={predlozenoIme(narudzba.imePrezime, narudzba.grad)}
        vecPoslano={vecOcijenjeno.length > 0}
        linkPreporuke={linkPreporuke(kodPreporuke)}
        procenat={PREPORUKA_PROCENAT}
        maksPrijatelja={PREPORUKA_MAKS_PRIJATELJA}
      />
    </div>
  );
}
