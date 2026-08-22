// TODO backend: ovo NIJE finalna perzistencija narudžbi — namjerno privremeno rješenje dok se ne
// odluči prava infrastruktura. Trenutno: validiramo payload i strukturisano ga ispisujemo u server
// log (console.log), pa vraćamo { ok: true, brojNarudzbe }. Prije lansiranja treba povezati:
//   1) Email obavještenje (npr. Resend — korisnik ga već koristi u drugom projektu) kupcu i/ili
//      vlasniku prodavnice, i
//   2) Bazu za trajno čuvanje narudžbi (Postgres/Prisma, isti obrazac kao Guestio projekat —
//      vidi project_guestio.md u projektnoj memoriji) umjesto da narudžba postoji samo u server logu.
// Dok ovo ne bude povezano, narudžbe se GUBE nakon restarta servera/deploya — korisnik je o ovome
// eksplicitno obaviješten, ovo nije tihi mock koji glumi uspjeh.

import { NextResponse } from "next/server";

import type {
  NacinPlacanja,
  NarudzbaKupac,
  NarudzbaOdgovor,
  NarudzbaPayload,
  NarudzbaStavka,
} from "./types";

const VAZECI_NACINI: NacinPlacanja[] = ["pouzece", "bankovni-transfer", "kartica"];

function jeNepraznString(vrijednost: unknown): vrijednost is string {
  return typeof vrijednost === "string" && vrijednost.trim().length > 0;
}

function validirajKupca(kupac: unknown): kupac is NarudzbaKupac {
  if (!kupac || typeof kupac !== "object") return false;
  const k = kupac as Record<string, unknown>;
  return (
    jeNepraznString(k.imePrezime) &&
    jeNepraznString(k.telefon) &&
    jeNepraznString(k.adresa) &&
    jeNepraznString(k.grad) &&
    (k.napomena === undefined || typeof k.napomena === "string")
  );
}

function validirajStavke(stavke: unknown): stavke is NarudzbaStavka[] {
  if (!Array.isArray(stavke) || stavke.length === 0) return false;
  return stavke.every((stavka) => {
    if (!stavka || typeof stavka !== "object") return false;
    const s = stavka as Record<string, unknown>;
    return (
      jeNepraznString(s.slug) &&
      jeNepraznString(s.naziv) &&
      typeof s.kolicina === "number" &&
      s.kolicina > 0 &&
      typeof s.cijenaPoKomadu === "number" &&
      s.cijenaPoKomadu >= 0 &&
      (s.dimenzija === undefined || typeof s.dimenzija === "string")
    );
  });
}

// Timestamp-based ID (ok u pravom Next.js route handleru — Date.now()/nasumičnost ovdje samo
// generišu čitljiv broj narudžbe, ne utiču na build/render determinizam).
function generisiBrojNarudzbe(): string {
  const sada = new Date();
  const yyyy = sada.getFullYear();
  const mm = String(sada.getMonth() + 1).padStart(2, "0");
  const dd = String(sada.getDate()).padStart(2, "0");
  const vrijemeKod = sada.getTime().toString(36).toUpperCase();
  return `AUR-${yyyy}${mm}${dd}-${vrijemeKod}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Neispravan zahtjev — podaci narudžbe nisu čitljivi." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Nedostaju podaci narudžbe." },
      { status: 400 }
    );
  }

  const payload = body as Partial<NarudzbaPayload>;

  if (!validirajKupca(payload.kupac)) {
    return NextResponse.json<NarudzbaOdgovor>(
      {
        ok: false,
        greska: "Nedostaju obavezni podaci kupca (ime i prezime, telefon, adresa, grad).",
      },
      { status: 400 }
    );
  }

  if (!payload.nacinPlacanja || !VAZECI_NACINI.includes(payload.nacinPlacanja)) {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Nepoznat način plaćanja." },
      { status: 400 }
    );
  }

  // Kartica (pay-by-link) je onemogućena na checkout formi dok API detalji provajdera nisu
  // dostavljeni (vidi TODO na vrhu fajla) — server je i dalje eksplicitno odbija, za slučaj da
  // neko pošalje POST direktno mimo forme.
  if (payload.nacinPlacanja === "kartica") {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Plaćanje karticom još nije dostupno — izaberite drugi način plaćanja." },
      { status: 400 }
    );
  }

  if (!validirajStavke(payload.stavke)) {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Korpa je prazna ili sadrži neispravne stavke." },
      { status: 400 }
    );
  }

  if (typeof payload.ukupnaCijena !== "number" || payload.ukupnaCijena <= 0) {
    return NextResponse.json<NarudzbaOdgovor>(
      { ok: false, greska: "Neispravan ukupan iznos narudžbe." },
      { status: 400 }
    );
  }

  const brojNarudzbe = generisiBrojNarudzbe();

  // Jedina "perzistencija" za sada — strukturisan, čitljiv log na serveru (vidi TODO backend gore).
  console.log(
    [
      `=== NOVA NARUDŽBA ${brojNarudzbe} ===`,
      `Vrijeme: ${new Date().toISOString()}`,
      `Kupac: ${payload.kupac.imePrezime} | telefon: ${payload.kupac.telefon}`,
      `Adresa: ${payload.kupac.adresa}, ${payload.kupac.grad}`,
      payload.kupac.napomena ? `Napomena: ${payload.kupac.napomena}` : null,
      `Način plaćanja: ${payload.nacinPlacanja}`,
      "Stavke:",
      ...payload.stavke.map(
        (s) =>
          `  - ${s.naziv}${s.dimenzija ? ` (${s.dimenzija})` : ""} x${s.kolicina} @ ${s.cijenaPoKomadu} KM`
      ),
      `Ukupno: ${payload.ukupnaCijena} KM`,
      "===================================",
    ]
      .filter(Boolean)
      .join("\n")
  );

  return NextResponse.json<NarudzbaOdgovor>({ ok: true, brojNarudzbe });
}
