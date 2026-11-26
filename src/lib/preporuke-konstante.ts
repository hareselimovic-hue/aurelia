// Program preporuka (korisnik, 26.11.2026) — brojke na jednom mjestu (koriste ih server, mailovi i
// tekstovi na sajtu). Bez importa servera, pa se smije koristiti i u klijentskim komponentama.

/** Popust za prijatelja na prvu narudžbu i za kupca po svakom prijatelju koji naruči. */
export const PREPORUKA_PROCENAT = 10;
/** Koliko prijatelja po kupcu donosi nagradu. */
export const PREPORUKA_MAKS_PRIJATELJA = 3;
/** Rok važenja nagradnog koda kupca. */
export const PREPORUKA_NAGRADA_DANA = 60;
/** Nagrada ide tek kad prijateljeva narudžba stoji "poslano" ovoliko dana (pouzeće: odbijen paket). */
export const PREPORUKA_CEKANJE_DANA = 7;
/** Mail nakon isporuke (recenzija + link) ide ovoliko dana nakon "poslano". */
export const MAIL_NAKON_SLANJA_DANA = 4;

export function linkPreporuke(kod: string): string {
  return `https://aurelia.ba/?promo=${encodeURIComponent(kod)}`;
}
