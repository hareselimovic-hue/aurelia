// Meta (Facebook/Instagram) Pixel — Aurelia dataset u Aurelia business portfoliju (korisnik, 25.11.2026).
// Bazni kod: src/components/analytics/meta-pixel.tsx. Ovdje samo siguran poziv iz klijentskih
// komponenti (ako je skripta blokirana adblockerom, fbq ne postoji → tiho ništa).

export const META_PIXEL_ID = "2251987255748336";

type Fbq = (komanda: "track", dogadjaj: string, parametri?: Record<string, unknown>) => void;

export function pratiMeta(
  dogadjaj: string,
  parametri?: Record<string, unknown>,
  pokusaj = 0,
): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== "function") {
    // Bazni kod se učitava "afterInteractive" — događaj s prvog renderovanja (npr. ViewContent)
    // može stići prije njega, pa se kratko pokuša ponovo (do ~3 s). Ako je blokiran, odustaje.
    if (pokusaj < 10) setTimeout(() => pratiMeta(dogadjaj, parametri, pokusaj + 1), 300);
    return;
  }
  try {
    fbq("track", dogadjaj, parametri);
  } catch {
    // analitika nikad ne smije srušiti kupovinu
  }
}

/** Zaokruženo na 2 decimale, valuta uvijek BAM. */
export function metaVrijednost(iznos: number): { value: number; currency: "BAM" } {
  return { value: Math.round(iznos * 100) / 100, currency: "BAM" };
}
