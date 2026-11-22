// Nagradna igra (korisnik, 21.11.2026). Jedno mjesto za datume, nagradu i Instagram profil —
// koriste ga stranica /nagradna-igra/, API prijave i admin. Za sljedeću igru: novi `kljuc` i datumi
// (stare prijave ostaju u bazi pod starim ključem).

export const INSTAGRAM_PROFIL = "aurelia.linen";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_PROFIL}/`;

export const NAGRADNA_IGRA = {
  kljuc: "decembar-2026",
  // Vrijeme u Sarajevu (CET, +01:00).
  // Početak pomjeren na 23.11. (korisnik, 22.11.2026), kraj ostaje 1.12.
  pocetak: new Date("2026-11-23T00:00:00+01:00"),
  kraj: new Date("2026-12-01T23:59:59+01:00"),
  izvlacenjeTekst: "2. decembra 2026.",
  trajanjeTekst: "od 23. novembra do 1. decembra 2026.",
  nagrade: [
    {
      slug: "posteljina-od-damasta-uska-linija",
      naziv: "2× Single posteljina od damasta — uska linija",
      sadrzaj: "2 × (Slifer 140×200 cm + 1 jastučnica)",
    },
    {
      slug: "posteljina-od-damasta-bracna",
      naziv: "Bračna posteljina od damasta",
      sadrzaj: "Slifer 200×200 cm + 2 jastučnice 50×70 cm",
    },
  ],
} as const;

export type StatusIgre = "uskoro" | "aktivna" | "zavrsena";

export function statusIgre(sada: Date = new Date()): StatusIgre {
  if (sada < NAGRADNA_IGRA.pocetak) return "uskoro";
  if (sada > NAGRADNA_IGRA.kraj) return "zavrsena";
  return "aktivna";
}

/** "@ime", "instagram.com/ime/", " Ime " → "ime". Vraća null ako nije ispravno korisničko ime. */
export function normalizujInstagram(unos: string): string | null {
  const cisto = unos
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(cisto) ? cisto : null;
}
