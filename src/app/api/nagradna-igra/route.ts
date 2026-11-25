// Prijava u nagradnu igru (/nagradna-igra/, korisnik 21.11.2026): upis u NagradnaPrijava + isti
// jednokratni kod za 10% kao popup (jedan po emailu). Ako je email već iskoristio popust, i dalje
// ulazi u izvlačenje, samo bez novog koda. Kupovina NIJE uslov za učešće.

import { NextResponse } from "next/server";

import { posaljiPotvrduNagradneIgre } from "@/app/api/narudzbe/email";
import type { NagradnaPrijavaOdgovor } from "@/app/api/narudzbe/types";
import {
  INSTAGRAM_URL,
  NAGRADNA_IGRA,
  normalizujInstagram,
  statusIgre,
} from "@/lib/nagradna-igra";
import { prisma } from "@/lib/prisma";
import { POPUP_PROCENAT, dodijeliKodZaEmail } from "@/lib/promo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function greska(poruka: string, status: number) {
  return NextResponse.json<NagradnaPrijavaOdgovor>(
    { ok: false, greska: poruka },
    { status },
  );
}

export async function POST(request: Request) {
  const status = statusIgre();
  if (status === "uskoro") return greska("Nagradna igra još nije počela.", 403);
  if (status === "zavrsena") return greska("Nagradna igra je završena.", 403);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // neispravan body → validacija ispod
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const instagram =
    typeof body.instagram === "string"
      ? normalizujInstagram(body.instagram)
      : null;

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return greska("Unesite ispravnu email adresu.", 400);
  }
  if (!instagram) {
    return greska(
      "Unesite ispravno Instagram korisničko ime (npr. @vase.ime).",
      400,
    );
  }
  if (body.prihvatamPravila !== true) {
    return greska(
      "Za učešće je potrebno prihvatiti pravila nagradne igre.",
      400,
    );
  }

  const vecPrijavljen = await prisma.nagradnaPrijava.findUnique({
    where: { igra_email: { igra: NAGRADNA_IGRA.kljuc, email } },
  });
  if (vecPrijavljen) {
    return greska(
      "Ova email adresa je već prijavljena u nagradnu igru. Sretno!",
      409,
    );
  }

  const dodjela = await dodijeliKodZaEmail(email);
  const kod =
    dodjela.status === "nov" || dodjela.status === "postojeci"
      ? dodjela.kod
      : null;

  try {
    await prisma.nagradnaPrijava.create({
      data: { igra: NAGRADNA_IGRA.kljuc, email, instagram, kod },
    });
  } catch {
    // Istovremena dupla prijava istog emaila — unique ograničenje je uhvatilo drugu.
    return greska(
      "Ova email adresa je već prijavljena u nagradnu igru. Sretno!",
      409,
    );
  }

  // Prijava je upisana bez obzira na mail — neuspjeh slanja se samo logguje (email.ts).
  // Vlasniku se namjerno NE šalje mail o prijavi (korisnik, 25.11.2026) — sve se vidi u
  // /admin/nagradna-igra/. Učesnik i dalje dobija potvrdu s kodom.
  await posaljiPotvrduNagradneIgre({
    email,
    kod,
    procenat: POPUP_PROCENAT,
    izvlacenjeTekst: NAGRADNA_IGRA.izvlacenjeTekst,
    instagramUrl: INSTAGRAM_URL,
  });

  return NextResponse.json<NagradnaPrijavaOdgovor>({
    ok: true,
    dobioKod: Boolean(kod),
  });
}
