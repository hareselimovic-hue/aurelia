import { NextResponse, type NextRequest } from "next/server";

import { KOLACIC_IME, jeSesijaValidna } from "@/lib/admin-sesija";

// CLAUDE_aurelia.md §10 (blokirajuće): "HTTPS na cijelom sajtu" i "Jedna verzija domene (www ili
// bez), 301 na drugu". Riješeno na nivou aplikacije (middleware) umjesto Apache/.htaccess — server
// (global.ba, Passenger iza Apache-a) ne mora imati dodatnu konfiguraciju, radi bez obzira na
// hosting. Kanonska verzija: BEZ www, uvijek HTTPS (isto kao SITE_URL konstanta kroz cijeli sajt).
//
// x-forwarded-proto se koristi umjesto request.nextUrl.protocol jer Passenger/Apache terminira SSL
// i prosljeđuje zahtjev interno kao obični HTTP — sam Next.js proces nikad ne vidi "https" direktno.
//
// 308 umjesto 301 (otkriveno 23.08.2026 pri testiranju /api/narudzbe): fetch() po specifikaciji
// PRETVARA POST u GET i briše tijelo zahtjeva kad prati 301/302 redirect, ali ne i 308 — bez ovoga
// bi checkout POST sa www.aurelia.ba (ili bilo koji edge-case http zahtjev) tiho izgubio cijelu
// narudžbu umjesto da vrati grešku. Za SEO je 308 identičan 301 (obje "permanent redirect", Google
// ih tretira isto), pa §10 zahtjev ostaje ispunjen.
// /admin/* je zaštićen HMAC-potpisanim kolačićem (src/lib/admin-sesija.ts) — jedina dijeljena
// lozinka, bez pravih korisničkih naloga (jednovlasnička prodavnica). /admin/login/ i /api/admin/login/
// su namjerno izuzeti ispod, inače se ne bi moglo ni doći do forme za prijavu.
const ZASTICENE_STRANICE_PREFIX = "/admin";
const ZASTICENE_API_PREFIX = "/api/admin";
const JAVNE_ADMIN_RUTE = ["/admin/login", "/api/admin/login"];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttp = forwardedProto === "http";
  const isWww = url.hostname.startsWith("www.");

  if (isHttp || isWww) {
    url.protocol = "https:";
    url.hostname = isWww ? url.hostname.slice(4) : url.hostname;
    return NextResponse.redirect(url, 308);
  }

  const putanja = url.pathname;
  const jeZasticenaStranica =
    putanja.startsWith(ZASTICENE_STRANICE_PREFIX) || putanja.startsWith(ZASTICENE_API_PREFIX);
  const jeJavnaAdminRuta = JAVNE_ADMIN_RUTE.some((ruta) => putanja.startsWith(ruta));

  if (jeZasticenaStranica && !jeJavnaAdminRuta) {
    const validna = await jeSesijaValidna(request.cookies.get(KOLACIC_IME)?.value);
    if (!validna) {
      if (putanja.startsWith(ZASTICENE_API_PREFIX)) {
        return NextResponse.json({ ok: false, greska: "Niste prijavljeni." }, { status: 401 });
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login/";
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Isključi Next.js interne rute i statične fajlove — redirect logika je nepotrebna (i skupa) za
  // njih, dovoljno je pokriti stranice koje korisnik/crawler stvarno posjećuje.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
