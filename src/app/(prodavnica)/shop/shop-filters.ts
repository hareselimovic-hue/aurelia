// Čista logika filtriranja/sortiranja/URL-parsinga za shop stranicu (src/app/shop/page.tsx +
// src/app/shop/filters.tsx). CLAUDE_aurelia.md §5-03 je "tehnički najosjetljiviji dio cijelog
// projekta" — filteri rade isključivo preko URL search parametara, nikad preko JS state-a bez
// promjene URL-a, pa ova logika mora biti čista funkcija (raw searchParams -> proizvodi /
// robots / canonical), bez React hooks-a, da je koriste i generateMetadata (server) i UI
// komponenta (client) na isti način.
//
// Namjerno odvojeno od page.tsx: generateMetadata i default export dijele ovu logiku, a
// filters.tsx (client, zbog Sheet drawera na mobilnom) je uvozi za gradnju href-ova i aktivnih
// stanja bez duplirane implementacije.

import type { Proizvod } from "@/lib/products";

/** Next.js 16 (page.js API ref, node_modules/next/dist/docs) prosljeđuje searchParams kao
 * Promise koji se resolvuje u ovaj oblik — svaki ključ može biti string, string[] (ponovljen
 * parametar u URL-u) ili undefined. */
export type RawSearchParams = { [key: string]: string | string[] | undefined };

/** Normalizovan oblik — svaki filter/sort parametar je najviše jedna vrijednost. */
export type ShopParams = {
  vrsta?: string;
  materijal?: string;
  dimenzija?: string;
  boja?: string;
  cijena?: string;
  sort?: string;
};

// Filteri iz CLAUDE_aurelia.md §5-03 (materijal, dimenzija, boja, cijena) + "vrsta" dodan po
// eksplicitnoj uputi orkestratora ("Proizvodi imaju kategorije: string[] polje ... i materijal
// polje — koristi ih za filtere"): stvaran asortiman miješa posteljinu/peškire/čaršafe u istom
// shop gridu (nepoznato kad je §5-03 pisan), pa je filter po vrsti proizvoda neophodan da grid
// ostane upotrebljiv. "sort" NIJE u ovoj listi — ima strože, zasebno noindex pravilo ispod.
const FILTER_KEYS = ["vrsta", "materijal", "dimenzija", "boja", "cijena"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
const SVI_KLJUCEVI = [...FILTER_KEYS, "sort"] as const;

function prviParam(value: string | string[] | undefined): string | undefined {
  const jedna = Array.isArray(value) ? value[0] : value;
  return jedna ? jedna : undefined;
}

/** Pretvara sirovi (await searchParams) rezultat u normalizovan ShopParams oblik. */
export function normalizeSearchParams(raw: RawSearchParams): ShopParams {
  return {
    vrsta: prviParam(raw.vrsta),
    materijal: prviParam(raw.materijal),
    dimenzija: prviParam(raw.dimenzija),
    boja: prviParam(raw.boja),
    cijena: prviParam(raw.cijena),
    sort: prviParam(raw.sort),
  };
}

/** Broj istovremeno aktivnih filtera (BEZ sort-a — sort ima sopstveno, strože pravilo ispod). */
export function brojAktivnihFiltera(params: ShopParams): number {
  return FILTER_KEYS.filter((key) => Boolean(params[key])).length;
}

/**
 * CLAUDE_aurelia.md §5-03, blokirajuća pravila:
 * - 2 ili više istovremeno aktivnih filtera -> `noindex,follow`
 * - sortiranje aktivno (eksplicitna `sort` vrijednost u URL-u) -> UVIJEK `noindex,follow`,
 *   nezavisno od broja filtera (čak i sort + 0 filtera je noindex — "sortiranje nikad ne smije
 *   biti indeksirano ako je eksplicitno postavljeno u URL-u")
 * - inače (0 ili 1 filter, bez sort parametra) -> `index,follow`
 *
 * Canonical NIJE dio ove funkcije — on je konstantan (`/shop/`) u SVIM slučajevima, računa se
 * direktno u generateMetadata (page.tsx).
 */
export function izracunajRobots(params: ShopParams): { index: boolean; follow: boolean } {
  const sortAktivan = Boolean(params.sort);
  const dvaPlusFiltera = brojAktivnihFiltera(params) >= 2;
  return { index: !sortAktivan && !dvaPlusFiltera, follow: true };
}

/** Izvodi "vrstu" proizvoda iz `kategorije` polja (products.ts) — koristi se za filter i za
 * grupisanje u SEO tabeli. Redoslijed provjera je namjeran: "damast"/"bracna" su pod-kategorije
 * posteljine, pa padaju u "posteljina" granu preko `return` na kraju. */
export function vrstaProizvoda(p: Proizvod): "posteljina" | "peskiri" | "carsafi" {
  if (p.kategorije.includes("peskiri")) return "peskiri";
  if (p.kategorije.includes("carsafi")) return "carsafi";
  return "posteljina";
}

// "posteljina" NEMA pilulu/filter-URL (SEO odluka 29.08.2026) — /shop/ je sama po sebi već
// fokusirana na posteljinu (H1 "Posteljina od pamučnog damasta"), pa ne treba zaseban
// ?vrsta=posteljina URL koji bi samo duplirao istu stranicu. Peškiri i čaršafi imaju prave
// kategorijske stranice (/shop/peskiri/, /shop/carsafi/) na koje njihove pilule vode — vidi
// vrstaHref() u ./filters.tsx.
export const VRSTA_OPCIJE: { value: string; label: string }[] = [
  { value: "peskiri", label: "Peškiri" },
  { value: "carsafi", label: "Čaršafi" },
];

// Cijena kao opisni raspon (bucket) umjesto slobodnog min/max unosa — jednostavnije za URL i
// dovoljno za 8 proizvoda iz faze 1. Granice pokrivaju stvaran raspon cijena (3-55 KM) sa
// rezervom za buduće, skuplje artikle (bucket "50-plus").
export const CIJENA_OPCIJE: {
  value: string;
  label: string;
  test: (cijena: number) => boolean;
}[] = [
  { value: "do-10", label: "do 10 KM", test: (c) => c <= 10 },
  { value: "10-20", label: "10–20 KM", test: (c) => c > 10 && c <= 20 },
  { value: "20-50", label: "20–50 KM", test: (c) => c > 20 && c <= 50 },
  { value: "50-plus", label: "50 KM i više", test: (c) => c > 50 },
];

export function materijalOpcije(products: Proizvod[]): string[] {
  return Array.from(new Set(products.map((p) => p.materijal))).sort();
}

export function dimenzijaOpcije(products: Proizvod[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.dimenzije))).sort();
}

export function bojaOpcije(products: Proizvod[]): string[] {
  return Array.from(new Set(products.map((p) => p.boja))).sort();
}

/** Kozmetičko formatiranje dimenzije za prikaz ("140x200 cm" -> "140×200 cm"). Vrijednost
 * korištena za filtriranje/URL ostaje sirova (iz products.ts) — samo label se formatira. */
export function formatDimenzija(dimenzija: string): string {
  return dimenzija.replace(/(\d)\s*x\s*(\d)/gi, "$1×$2");
}

export function filtrirajProizvode(products: Proizvod[], params: ShopParams): Proizvod[] {
  return products.filter((p) => {
    if (params.vrsta && vrstaProizvoda(p) !== params.vrsta) return false;
    if (params.materijal && p.materijal !== params.materijal) return false;
    if (params.dimenzija && !p.dimenzije.includes(params.dimenzija)) return false;
    if (params.boja && p.boja !== params.boja) return false;
    if (params.cijena) {
      const opcija = CIJENA_OPCIJE.find((o) => o.value === params.cijena);
      if (opcija && !opcija.test(p.cijena)) return false;
    }
    return true;
  });
}

export const SORT_OPCIJE: { value: string; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "cijena-asc", label: "Cijena ↑" },
  { value: "cijena-desc", label: "Cijena ↓" },
];

/** "novo" je zadano (prirodni redoslijed iz products.ts) i NIKAD ne ide u URL kao `sort=novo` —
 * vidi hrefSortiranja u filters.tsx. Ovdje se i dalje tretira kao validna eksplicitna vrijednost
 * radi robusnosti (npr. ručno ukucan URL). */
export function sortirajProizvode(products: Proizvod[], sort: string | undefined): Proizvod[] {
  if (sort === "cijena-asc") return [...products].sort((a, b) => a.cijena - b.cijena);
  if (sort === "cijena-desc") return [...products].sort((a, b) => b.cijena - a.cijena);
  return products;
}

/** Gradi `/shop/` href sa izmijenjenim jednim parametrom, čuvajući ostale trenutno aktivne.
 * `value: undefined` uklanja taj parametar (koristi se i za toggle-off klik na već aktivnu
 * opciju, i za "Sve"/"Novo" linkove). */
export function hrefSaIzmjenom(
  current: ShopParams,
  key: FilterKey | "sort",
  value: string | undefined
): string {
  const usp = new URLSearchParams();
  for (const k of SVI_KLJUCEVI) {
    if (k === key) continue;
    const v = current[k];
    if (v) usp.set(k, v);
  }
  if (value) usp.set(key, value);
  const qs = usp.toString();
  return `/shop/${qs ? `?${qs}` : ""}`;
}
