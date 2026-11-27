/**
 * Meta description do `max` znakova (SEO audit 27.11.2026 — Google siječe oko 155).
 * Reže na zadnjoj cijeloj rečenici koja stane; ako nijedna ne stane, na zadnjoj cijeloj
 * riječi + "…". Kratak tekst vraća nepromijenjen.
 */
export function skratiMetaOpis(tekst: string, max = 155): string {
  const cist = tekst.replace(/\s+/g, " ").trim();
  if (cist.length <= max) return cist;

  const isjecak = cist.slice(0, max);
  const krajRecenice = Math.max(
    isjecak.lastIndexOf(". "),
    isjecak.lastIndexOf("! "),
    isjecak.lastIndexOf("? ")
  );
  // Rečenica se uzima samo ako nije prekratka (inače je opis previše siromašan).
  if (krajRecenice >= 80) return isjecak.slice(0, krajRecenice + 1);

  const zadnjiRazmak = cist.slice(0, max - 1).lastIndexOf(" ");
  return `${cist.slice(0, zadnjiRazmak).replace(/[\s,;:—–-]+$/, "")}…`;
}
