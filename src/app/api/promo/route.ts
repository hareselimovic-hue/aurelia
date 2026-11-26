// Provjera promo koda za checkout (dugme "Primijeni" + automatska primjena koda iz popupa/maila).
// Samo za prikaz popusta prije slanja — /api/narudzbe nezavisno ponovo provjerava i troši kod.

import { NextResponse } from "next/server";

import { provjeriKod } from "@/lib/promo";
import type { PromoOdgovor } from "@/app/api/narudzbe/types";

export async function POST(request: Request) {
  let kod = "";
  try {
    const body = (await request.json()) as { kod?: unknown };
    if (typeof body.kod === "string") kod = body.kod;
  } catch {
    // prazan/neispravan body → tretira se kao prazan kod
  }

  const rezultat = await provjeriKod(kod);
  if (!rezultat.ok) {
    return NextResponse.json<PromoOdgovor>(rezultat, { status: 400 });
  }
  return NextResponse.json<PromoOdgovor>({
    ok: true,
    kod: rezultat.kod,
    procenat: rezultat.procenat,
    opis: rezultat.preporuka
      ? `Poklon od: ${rezultat.preporuka.ime} — važi za prvu narudžbu`
      : undefined,
  });
}
