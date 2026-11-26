// /podijeli/[kod]/ (korisnik, 26.11.2026) — dugmad i link iz maila nakon isporuke vode ovdje (Gmail
// blokira viber:// u mailovima, a direktan ?promo= link je kupca vodio u shop s njegovim kodom).
// ?na=viber | ?na=whatsapp → odmah otvara aplikaciju s porukom za prijatelja.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PreporukaKutija } from "@/components/preporuka-kutija";
import { prisma } from "@/lib/prisma";
import {
  PREPORUKA_MAKS_PRIJATELJA,
  PREPORUKA_PROCENAT,
  linkPreporuke,
} from "@/lib/preporuke-konstante";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Poklonite prijatelju 10% | Aurelia.ba",
  robots: { index: false, follow: false },
};

export default async function PodijeliPage({
  params,
  searchParams,
}: {
  params: Promise<{ kod: string }>;
  searchParams: Promise<{ na?: string }>;
}) {
  const { kod } = await params;
  const { na } = await searchParams;
  const preporuka = await prisma.preporuka.findUnique({
    where: { kod: decodeURIComponent(kod).toUpperCase() },
  });
  if (!preporuka) notFound();

  const iskoristeno = await prisma.preporukaKoristenje.count({
    where: { preporukaKod: preporuka.kod, ponistenoAt: null },
  });
  const preostalo = Math.max(0, PREPORUKA_MAKS_PRIJATELJA - iskoristeno);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:py-20">
      <p className="text-eyebrow text-primary">Za vaše prijatelje</p>
      <h1 className="mt-3">{preporuka.ime}, hvala što ste s nama</h1>
      <p className="mt-4 text-muted-foreground">
        {preostalo > 0
          ? `Link možete poslati prijateljima — još ${preostalo} ${preostalo === 1 ? "prijatelj može" : "prijatelja mogu"} donijeti vama novi kod za ${PREPORUKA_PROCENAT}%.`
          : "Iskoristili ste sve preporuke — hvala vam!"}
      </p>

      <PreporukaKutija
        kod={preporuka.kod}
        link={linkPreporuke(preporuka.kod)}
        procenat={PREPORUKA_PROCENAT}
        maksPrijatelja={PREPORUKA_MAKS_PRIJATELJA}
        otvori={na === "viber" || na === "whatsapp" ? na : null}
      />

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/shop/" className="text-primary underline-offset-4 hover:underline">
          Pogledajte ponudu
        </Link>
      </p>
    </div>
  );
}
