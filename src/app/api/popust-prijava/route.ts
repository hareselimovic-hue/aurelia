// Prijava iz popupa "ostavi email, dobij 10%" (korisnik, 19.11.2026): za svaki email generiše
// jednokratni kod (tabela PromoKod), šalje ga kupcu mailom i javlja vlasniku na info@aurelia.ba.
// Isti email opet → ponovo se šalje njegov postojeći neiskorišteni kod (ne pravi se novi, da se
// popust ne može "farmati" višestrukim prijavama). Ako je email već iskoristio kod, novi se ne daje.

import { NextResponse } from "next/server";

import { posaljiObavjestenjePrijava, posaljiPromoKodKupcu } from "@/app/api/narudzbe/email";
import type { PopustPrijavaOdgovor } from "@/app/api/narudzbe/types";
import { prisma } from "@/lib/prisma";
import { POPUP_PROCENAT, generisiKod } from "@/lib/promo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    // neispravan body → prazan email ispod
  }

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return NextResponse.json<PopustPrijavaOdgovor>(
      { ok: false, greska: "Unesite ispravnu email adresu." },
      { status: 400 }
    );
  }

  const postojeci = await prisma.promoKod.findMany({ where: { email } });
  if (postojeci.some((k) => k.iskoristenAt)) {
    return NextResponse.json<PopustPrijavaOdgovor>(
      { ok: false, greska: "Popust za ovu email adresu je već iskorišten." },
      { status: 409 }
    );
  }

  let kod = postojeci[0]?.kod;
  const novaPrijava = !kod;
  if (!kod) {
    // Kolizija 6 nasumičnih znakova (31^6 ≈ 887 mil.) je praktično nemoguća, ali ipak par pokušaja.
    for (let pokusaj = 0; pokusaj < 5 && !kod; pokusaj++) {
      const kandidat = generisiKod();
      try {
        await prisma.promoKod.create({
          data: { kod: kandidat, email, procenat: POPUP_PROCENAT },
        });
        kod = kandidat;
      } catch {
        // duplikat ključa → novi pokušaj
      }
    }
    if (!kod) {
      return NextResponse.json<PopustPrijavaOdgovor>(
        { ok: false, greska: "Došlo je do greške. Pokušajte ponovo." },
        { status: 500 }
      );
    }
  }

  const [poslano] = await Promise.all([
    posaljiPromoKodKupcu({ email, kod, procenat: POPUP_PROCENAT }),
    novaPrijava ? posaljiObavjestenjePrijava({ email, kod }) : Promise.resolve(),
  ]);

  if (!poslano) {
    return NextResponse.json<PopustPrijavaOdgovor>(
      { ok: false, greska: "Slanje maila nije uspjelo. Provjerite adresu i pokušajte ponovo." },
      { status: 502 }
    );
  }

  return NextResponse.json<PopustPrijavaOdgovor>({ ok: true });
}
