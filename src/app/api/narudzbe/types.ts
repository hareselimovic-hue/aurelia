// Zajednički tipovi za narudžbu — dijeli ih checkout forma (klijent, src/app/checkout/*) i ova API
// ruta (server, ./route.ts), da payload ostane usklađen na oba mjesta bez dupliranja shape-a.
// Odvojeno od route.ts namjerno: Next.js route handler fajlovi smiju eksportovati samo prepoznate
// HTTP-metod funkcije (+ par posebnih konfiguracionih exporta) — dodatni type export ovdje izbjegava
// bilo kakav rizik oko toga, a čist je za import u klijentsku komponentu (tipovi se brišu na build-u,
// pa uvoz ovog fajla u "use client" stranicu ne povlači nikakav server kod u klijentski bundle).

export type NacinPlacanja = "pouzece" | "bankovni-transfer" | "kartica";

export type NarudzbaStavka = {
  slug: string;
  naziv: string;
  dimenzija?: string;
  kolicina: number;
  cijenaPoKomadu: number;
};

export type NarudzbaKupac = {
  imePrezime: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanskiBroj: string;
  napomena?: string;
};

export type NarudzbaPayload = {
  kupac: NarudzbaKupac;
  nacinPlacanja: NacinPlacanja;
  stavke: NarudzbaStavka[];
  // Zbir stavki BEZ dostave — server nezavisno preračunava cijenu dostave iz postanskiBroj
  // (src/lib/dostava.ts) i sam je dodaje, ne vjeruje klijentu za taj dio (vidi route.ts).
  ukupnaCijena: number;
};

export type NarudzbaOdgovor =
  | { ok: true; brojNarudzbe: string }
  | { ok: false; greska: string };
