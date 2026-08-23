import { NextResponse } from "next/server";

import { KOLACIC_IME, napraviSesijskiKolacic } from "@/lib/admin-sesija";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, greska: "Neispravan zahtjev." }, { status: 400 });
  }

  const lozinka = (body as { lozinka?: unknown })?.lozinka;
  const ocekivanaLozinka = process.env.ADMIN_PASSWORD;

  if (!ocekivanaLozinka) {
    console.error("ADMIN_PASSWORD nije postavljen — admin login onemogućen.");
    return NextResponse.json({ ok: false, greska: "Admin login nije konfigurisan." }, { status: 500 });
  }

  if (typeof lozinka !== "string" || lozinka !== ocekivanaLozinka) {
    return NextResponse.json({ ok: false, greska: "Pogrešna lozinka." }, { status: 401 });
  }

  const kolacic = await napraviSesijskiKolacic();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(KOLACIC_IME, kolacic, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
