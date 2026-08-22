/**
 * Jedina tačka za formatiranje cijene u KM (CLAUDE_aurelia.md §11 — "Formatiranje cijene ide kroz
 * jedan helper, nigdje hardkodirano"). Zarez je decimalni separator (bosanska konvencija), npr. 18
 * -> "18,00 KM", 1234.5 -> "1.234,50 KM".
 *
 * Namjerno NE koristi `Intl.NumberFormat("bs-BA", ...)` — Node/Next build i runtime okruženja često
 * imaju samo "small-icu" (bez punih podataka za bs-BA), pa bi lokalizacija tiho pala nazad na
 * en-US format (tačka umjesto zareza). Ručna implementacija je deterministička i identična svugdje
 * (server, klijent, build).
 */
export function formatPrice(cijena: number): string {
  const [cijeliDio, decimalniDio] = cijena.toFixed(2).split(".");
  const cijeliDioFormatiran = cijeliDio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cijeliDioFormatiran},${decimalniDio} KM`;
}
