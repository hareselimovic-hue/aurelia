// Prijem recenzije s /recenzija/[token]/ (korisnik, 26.11.2026). Status "ceka" — na sajtu tek kad
// vlasnik odobri u /admin/recenzije/.

import { NextResponse } from "next/server";

import type { NarudzbaStavka } from "@/app/api/narudzbe/types";
import { prisma } from "@/lib/prisma";

type Unos = { token?: unknown; ime?: unknown; ocjene?: unknown };

function greska(poruka: string, status = 400) {
  return NextResponse.json({ ok: false, greska: poruka }, { status });
}

export async function POST(request: Request) {
  let body: Unos;
  try {
    body = (await request.json()) as Unos;
  } catch {
    return greska("Neispravan zahtjev.");
  }

  if (typeof body.token !== "string" || !body.token) return greska("Neispravan link.");
  const ime = typeof body.ime === "string" ? body.ime.trim().slice(0, 60) : "";
  if (!ime) return greska("Upišite ime koje će se prikazati uz recenziju.");
  if (!Array.isArray(body.ocjene) || body.ocjene.length === 0) return greska("Nema ocjena.");

  const narudzba = await prisma.narudzba.findUnique({ where: { recenzijaToken: body.token } });
  if (!narudzba || narudzba.status === "vraceno") return greska("Link nije važeći.", 404);

  const dozvoljeni = new Set((narudzba.stavke as unknown as NarudzbaStavka[]).map((s) => s.slug));
  const redovi: { slug: string; ocjena: number; komentar: string | null }[] = [];
  for (const o of body.ocjene as Record<string, unknown>[]) {
    const slug = typeof o?.slug === "string" ? o.slug : "";
    const ocjena = typeof o?.ocjena === "number" ? Math.round(o.ocjena) : 0;
    if (!dozvoljeni.has(slug) || ocjena < 1 || ocjena > 5) return greska("Neispravna ocjena.");
    const komentar =
      typeof o.komentar === "string" && o.komentar.trim() ? o.komentar.trim().slice(0, 1000) : null;
    redovi.push({ slug, ocjena, komentar });
  }

  await prisma.recenzija.createMany({
    data: redovi.map((r) => ({ ...r, brojNarudzbe: narudzba.brojNarudzbe, ime })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true });
}
