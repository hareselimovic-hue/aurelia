// Podsjetnik za neiskorištene promo kodove (korisnik, 24.11.2026): kod dodijeljen prije 2+ dana,
// nije iskorišten, podsjetnik još nije poslan → jedan mail. Pokreće ga Vercel Cron jednom dnevno
// (vercel.json); Vercel šalje "Authorization: Bearer $CRON_SECRET".
//
// Prozor je 2–14 dana: stariji kodovi se ne diraju (da prvo pokretanje ne pošalje mail ljudima
// koji su kod dobili davno). Ako je email u međuvremenu naručio (s kodom ili bez), ne šalje se.

import { NextResponse } from "next/server";

import { posaljiPodsjetnikKoda } from "@/app/api/narudzbe/email";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DAN_MS = 24 * 60 * 60 * 1000;
const NAJVISE_PO_POKRETANJU = 100;

export async function GET(request: Request) {
  const tajna = process.env.CRON_SECRET;
  if (!tajna || request.headers.get("authorization") !== `Bearer ${tajna}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sada = Date.now();
  const kandidati = await prisma.promoKod.findMany({
    where: {
      iskoristenAt: null,
      podsjetnikPoslanAt: null,
      createdAt: { lte: new Date(sada - 2 * DAN_MS), gte: new Date(sada - 14 * DAN_MS) },
    },
    orderBy: { createdAt: "asc" },
    take: NAJVISE_PO_POKRETANJU,
  });

  let poslano = 0;
  let preskoceno = 0;
  let neuspjelo = 0;

  for (const k of kandidati) {
    const naruceno = await prisma.narudzba.findFirst({
      where: { email: { equals: k.email, mode: "insensitive" }, createdAt: { gte: k.createdAt } },
      select: { id: true },
    });

    // Prvo "zauzmi" kod (atomarno) da dva paralelna pokretanja ne pošalju dva maila.
    const zauzeto = await prisma.promoKod.updateMany({
      where: { kod: k.kod, podsjetnikPoslanAt: null, iskoristenAt: null },
      data: { podsjetnikPoslanAt: new Date() },
    });
    if (zauzeto.count === 0) continue;

    if (naruceno) {
      preskoceno++;
      continue;
    }

    const ok = await posaljiPodsjetnikKoda({ email: k.email, kod: k.kod, procenat: k.procenat });
    if (ok) {
      poslano++;
    } else {
      neuspjelo++;
      // Vrati da cron pokuša ponovo sutra.
      await prisma.promoKod.update({ where: { kod: k.kod }, data: { podsjetnikPoslanAt: null } });
    }
  }

  return NextResponse.json({ ok: true, kandidata: kandidati.length, poslano, preskoceno, neuspjelo });
}
