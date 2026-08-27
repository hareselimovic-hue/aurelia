// Cijena dostave — indikator je poštanski broj kupca (korisnik, 27.08.2026): 71000 (Sarajevo) =
// besplatna dostava, sve ostalo ima fiksnu cijenu. Jedan izvor istine — koristi ga i checkout forma
// (prikaz uživo dok kupac kuca), i server (route.ts, nezavisno preračunava iz poštanskog broja
// umjesto da vjeruje cijeni koju bi klijent mogao poslati).

export const POSTANSKI_BROJ_BESPLATNE_DOSTAVE = "71000";
export const CIJENA_DOSTAVE = 9.9;

/** `null` = poštanski broj još nije unesen (nepoznato), inače stvarna cijena dostave u KM. */
export function izracunajDostavu(postanskiBroj: string): number | null {
  const trimovano = postanskiBroj.trim();
  if (!trimovano) return null;
  return trimovano === POSTANSKI_BROJ_BESPLATNE_DOSTAVE ? 0 : CIJENA_DOSTAVE;
}
