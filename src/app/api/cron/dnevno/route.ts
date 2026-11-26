// Dnevni cron (vercel.json, 09:00 UTC = 10:00 Sarajevo). Vercel šalje "Authorization: Bearer
// $CRON_SECRET". Poslovi: src/lib/cron-poslovi.ts.

import { NextResponse } from "next/server";

import { mailoviNakonIsporuke, nagradeZaPreporuke, podsjetniciKodova } from "@/lib/cron-poslovi";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const tajna = process.env.CRON_SECRET;
  if (!tajna || request.headers.get("authorization") !== `Bearer ${tajna}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const podsjetnici = await podsjetniciKodova();
  const nakonIsporuke = await mailoviNakonIsporuke();
  const nagrade = await nagradeZaPreporuke();

  return NextResponse.json({ ok: true, podsjetnici, nakonIsporuke, nagrade });
}
