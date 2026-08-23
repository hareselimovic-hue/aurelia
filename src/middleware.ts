import { NextResponse, type NextRequest } from "next/server";

// CLAUDE_aurelia.md §10 (blokirajuće): "HTTPS na cijelom sajtu" i "Jedna verzija domene (www ili
// bez), 301 na drugu". Riješeno na nivou aplikacije (middleware) umjesto Apache/.htaccess — server
// (global.ba, Passenger iza Apache-a) ne mora imati dodatnu konfiguraciju, radi bez obzira na
// hosting. Kanonska verzija: BEZ www, uvijek HTTPS (isto kao SITE_URL konstanta kroz cijeli sajt).
//
// x-forwarded-proto se koristi umjesto request.nextUrl.protocol jer Passenger/Apache terminira SSL
// i prosljeđuje zahtjev interno kao obični HTTP — sam Next.js proces nikad ne vidi "https" direktno.
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttp = forwardedProto === "http";
  const isWww = url.hostname.startsWith("www.");

  if (isHttp || isWww) {
    url.protocol = "https:";
    url.hostname = isWww ? url.hostname.slice(4) : url.hostname;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Isključi Next.js interne rute i statične fajlove — redirect logika je nepotrebna (i skupa) za
  // njih, dovoljno je pokriti stranice koje korisnik/crawler stvarno posjećuje.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
