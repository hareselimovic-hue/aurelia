// Prijava iz popupa "ostavi email, dobij 10%" (korisnik, 19.11.2026): za svaki email jednokratni
// kod (src/lib/promo.ts dodijeliKodZaEmail), šalje ga kupcu mailom i javlja vlasniku na
// info@aurelia.ba. Isti email opet → ponovo se šalje postojeći neiskorišteni kod.

import { NextResponse } from "next/server";

import {
  posaljiObavjestenjePrijava,
  posaljiPromoKodKupcu,
} from "@/app/api/narudzbe/email";
import type { PopustPrijavaOdgovor } from "@/app/api/narudzbe/types";
import { POPUP_PROCENAT, dodijeliKodZaEmail } from "@/lib/promo";

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
      { status: 400 },
    );
  }

  const dodjela = await dodijeliKodZaEmail(email);
  if (dodjela.status === "iskoristen") {
    return NextResponse.json<PopustPrijavaOdgovor>(
      { ok: false, greska: "Popust za ovu email adresu je već iskorišten." },
      { status: 409 },
    );
  }
  if (dodjela.status === "greska") {
    return NextResponse.json<PopustPrijavaOdgovor>(
      { ok: false, greska: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 },
    );
  }

  const [poslano] = await Promise.all([
    posaljiPromoKodKupcu({ email, kod: dodjela.kod, procenat: POPUP_PROCENAT }),
    dodjela.status === "nov"
      ? posaljiObavjestenjePrijava({ email, kod: dodjela.kod })
      : Promise.resolve(),
  ]);

  if (!poslano) {
    return NextResponse.json<PopustPrijavaOdgovor>(
      {
        ok: false,
        greska:
          "Slanje maila nije uspjelo. Provjerite adresu i pokušajte ponovo.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json<PopustPrijavaOdgovor>({ ok: true });
}
