// Model podataka proizvoda — CLAUDE_aurelia.md §3 (obavezujuća specifikacija).
//
// Status (docs/product-data-raw.md, korisnik 22.08.2026): 8 od 15 proizvoda faze 1 ima stvarne
// podatke (cijena + dimenzija, iz cjenovnika). Fali još 7 da se dostigne cilj od 15 iz §1 — dodati
// ih ovdje kad korisnik pošalje ostatak asortimana. Boje i fotografije nedostaju za sve — vidi
// PLACEHOLDER_IMAGE i BOJA_PRIVREMENA niže.

/**
 * Minimalni shape proizvoda po CLAUDE_aurelia.md §3.
 *
 * Napomena o `materijal`: originalni union u specifikaciji je
 * "pamuk" | "ranforce" | "saten" | "mikrofiber". Proširen je sa "pamučni damast" jer stvarni
 * asortiman (posteljina od damasta, stavke #1-2 iz product-data-raw.md) koristi žakardno tkanje
 * koje ne odgovara nijednoj od te 4 vrijednosti.
 */
export type Proizvod = {
  slug: string; // "pamucna-posteljina-aurora" — malim slovima, crtica, bez dijakritike
  naziv: string; // "Pamučna posteljina Aurora 200x200"
  cijena: number; // 49.90
  cijenaStara?: number; // za prikaz sniženja
  materijal: "pamuk" | "ranforce" | "saten" | "mikrofiber" | "pamučni damast";
  dimenzije: string[]; // ["140x200 cm", "160x200 cm", "200x200 cm"]
  boja: string;
  opisKratki: string; // ~50 riječi, ide iznad preloma
  opisDugi: string; // 150-250 riječi, JEDINSTVEN za svaki proizvod
  specifikacije: { kljuc: string; vrijednost: string }[];
  slike: { url: string; alt: string }[]; // min 4, prva je glavna
  naStanju: boolean;
  kategorije: string[]; // ["pamucna", "bracna"] — za filtere u fazi 1
};

/**
 * Sentinel vrijednost za nedostajuće fotografije proizvoda. Komponente koje renderuju sliku
 * (npr. `KarticaProizvoda`) provjeravaju `url === PLACEHOLDER_IMAGE` i u tom slučaju renderuju
 * `<PlaceholderImage>` (čist CSS/DOM, src/components/placeholder-image.tsx) umjesto `<img>`, jer
 * fajl na ovoj putanji stvarno ne postoji. Kad prave fotografije stignu, mijenja se samo ova
 * putanja (i alt tekst ostaje isti) — struktura modela se ne mijenja.
 */
export const PLACEHOLDER_IMAGE = "/placeholder/proizvod.jpg";

// Boja "Prema dogovoru" je privremena vrijednost za SVE proizvode — korisnik još nije potvrdio
// konkretne boje/varijante iz asortimana (docs/product-data-raw.md: "Nedostaje za sve: boje").
const BOJA_PRIVREMENA = "Prema dogovoru";

// Alt šablon iz CLAUDE_aurelia.md §3 je "{materijal} posteljina {boja} {dimenzija}", pisan prije
// nego što su peškiri/čaršafi ušli u katalog (sada dio istog Proizvod modela, CLAUDE.md pravilo:
// bez posebne SEO kategorije za njih u fazi 1). Da alt tekst ostane tačan i za njih, riječ
// "posteljina" se ovdje generiše iz stvarne vrste proizvoda umjesto da bude hardkodirana.
function vrstaZaAlt(kategorije: string[]): string {
  if (kategorije.includes("peskiri")) return "peškir";
  if (kategorije.includes("carsafi")) return "čaršaf";
  return "posteljina";
}

/** Alt tekst se generiše iz atributa proizvoda, NIKAD iz imena fajla (CLAUDE_aurelia.md §3, §10). */
function generisiAlt(
  materijal: Proizvod["materijal"],
  kategorije: string[],
  boja: string,
  dimenzija: string
): string {
  return `${materijal} ${vrstaZaAlt(kategorije)} ${boja} ${dimenzija}`.trim();
}

/**
 * Generiše min. 4 slike po proizvodu ("min 4, prva je glavna" — CLAUDE_aurelia.md §3).
 * Ako je `glavnaSlika` proslijeđena (stvarna fotografija iz "slike aurelia" foldera, 22.08.2026),
 * ona zamjenjuje prvi placeholder — ostatak galerije (potrebne dodatne slike: detalj, u sobi,
 * pakovanje...) ostaje placeholder dok korisnik ne pošalje više fotografija po proizvodu.
 */
function generisiSlike(
  materijal: Proizvod["materijal"],
  kategorije: string[],
  boja: string,
  dimenzija: string,
  glavnaSlika?: string,
  broj = 4
): { url: string; alt: string }[] {
  const alt = generisiAlt(materijal, kategorije, boja, dimenzija);
  const slike = Array.from({ length: broj }, () => ({ url: PLACEHOLDER_IMAGE, alt }));
  if (glavnaSlika) {
    slike[0] = { url: glavnaSlika, alt };
  }
  return slike;
}

export const PROIZVODI: Proizvod[] = [
  {
    slug: "posteljina-od-damasta-uska-linija",
    naziv: "Posteljina od damasta — uska linija (Slifer + 1 jastučnica)",
    cijena: 18,
    materijal: "pamučni damast",
    dimenzije: ["140x200 cm"],
    boja: BOJA_PRIVREMENA,
    // TODO copy: aurelia-copywriter — privremen tekst iz ranijeg razgovora s korisnikom, NIJE
    // finalni marketinški copy. Copywriter agent piše finalnu, jedinstvenu verziju za svih 15
    // proizvoda (CLAUDE_aurelia.md §7: "kopiranje opisa od dobavljača je najveća greška").
    opisKratki:
      "Posteljina od 100% češljanog pamučnog damasta, žakardno tkanje s blagim sjajem. Set: Slifer (poplun-navlaka) 140×200 cm + 1 jastučnica.",
    // TODO copy: aurelia-copywriter — privremen tekst, ne finalni ton/dužina (150-250 riječi, §3).
    opisDugi:
      "Posteljina izrađena od 100% češljanog pamučnog damasta sa žakardnim tkanjem koje daje blagi, prirodan sjaj tkanini. Set uska linija sadrži Slifer (navlaku za poplun) dimenzija 140×200 cm i jednu jastučnicu. Materijal je dugotrajan i izdržava pranje na temperaturi do 95°C, što ga čini praktičnim za svakodnevnu upotrebu i redovno održavanje.",
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamučni damast (žakardno tkanje)" },
      { kljuc: "Set sadrži", vrijednost: "Slifer + 1 jastučnica" },
      { kljuc: "Dimenzija Slifer", vrijednost: "140×200 cm" },
      { kljuc: "Pranje", vrijednost: "do 95°C" },
    ],
    slike: generisiSlike(
      "pamučni damast",
      ["posteljina", "damast"],
      BOJA_PRIVREMENA,
      "140x200 cm",
      "/images/products/damast-uska-linija-1.webp"
    ),
    naStanju: true,
    kategorije: ["posteljina", "damast"],
  },
  {
    slug: "posteljina-od-damasta-bracna",
    // NAPOMENA (korisnik, 22.08.2026): "čaršaf na gumu" je izbačen iz ovog seta — prodaje se
    // zasebno kao svoj proizvod (vidi "carsaf-na-gumu-bracni-220x240" niže). Cijena od 55 KM je
    // prenesena iz originalnog cjenovnika koji JE uključivao čaršaf na gumu — treba potvrditi s
    // korisnikom da li se cijena mijenja sad kad set ima jedan komad manje.
    naziv: "Posteljina od damasta — bračna (Slifer + 2 jastučnice)",
    cijena: 55,
    materijal: "pamučni damast",
    dimenzije: ["Slifer 200x200 cm", "jastučnica 50x70 cm (2 kom)"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamučni damast (žakardno tkanje)" },
      { kljuc: "Set sadrži", vrijednost: "Slifer + 2 jastučnice" },
      { kljuc: "Dimenzija Slifer", vrijednost: "200×200 cm" },
      { kljuc: "Dimenzija jastučnice", vrijednost: "50×70 cm (2 komada)" },
    ],
    slike: generisiSlike(
      "pamučni damast",
      ["posteljina", "damast", "bracna"],
      BOJA_PRIVREMENA,
      "200x200 cm",
      "/images/products/damast-bracna-1.webp"
    ),
    naStanju: true,
    kategorije: ["posteljina", "damast", "bracna"],
  },
  {
    slug: "peskir-140x70",
    naziv: "Peškir 140×70 cm",
    cijena: 7,
    materijal: "pamuk",
    dimenzije: ["140x70 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "140×70 cm" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["peskiri"],
      BOJA_PRIVREMENA,
      "140x70 cm",
      "/images/products/peskir-140x70-1.webp"
    ),
    naStanju: true,
    kategorije: ["peskiri"],
  },
  {
    slug: "peskir-85x45",
    naziv: "Peškir 85×45 cm",
    cijena: 3,
    materijal: "pamuk",
    dimenzije: ["85x45 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "85×45 cm" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["peskiri"],
      BOJA_PRIVREMENA,
      "85x45 cm",
      "/images/products/peskir-85x45-1.webp"
    ),
    naStanju: true,
    kategorije: ["peskiri"],
  },
  {
    slug: "carsaf-160x240",
    naziv: "Čaršaf 160×240 cm",
    cijena: 13,
    materijal: "pamuk",
    dimenzije: ["160x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "160×240 cm" },
    ],
    // Ista opšta čaršaf fotografija dijeli se sa druga 2 "obična" čaršafa niže — imamo samo 1
    // generičku fotografiju za taj tip proizvoda dok korisnik ne pošalje snimke po dimenziji.
    slike: generisiSlike(
      "pamuk",
      ["carsafi"],
      BOJA_PRIVREMENA,
      "160x240 cm",
      "/images/products/carsaf-1.webp"
    ),
    naStanju: true,
    kategorije: ["carsafi"],
  },
  {
    slug: "carsaf-220x240",
    naziv: "Čaršaf 220×240 cm",
    cijena: 15,
    materijal: "pamuk",
    dimenzije: ["220x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "220×240 cm" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["carsafi"],
      BOJA_PRIVREMENA,
      "220x240 cm",
      "/images/products/carsaf-1.webp"
    ),
    naStanju: true,
    kategorije: ["carsafi"],
  },
  {
    slug: "carsaf-240x260",
    // Naziv zadržava "240×260" iz izvora (docs/product-data-raw.md, red #7), iako je u istom redu
    // navedena dimenzija 240×290 cm — očigledna nedosljednost u korisnikovom cjenovniku (naziv i
    // dimenzija se ne poklapaju). Polje `dimenzije` niže nosi stvarno navedenu vrijednost (240×290);
    // naziv nije mijenjan dok korisnik ne potvrdi koja je od te dvije brojke tačna.
    naziv: "Čaršaf 240×260",
    cijena: 19,
    materijal: "pamuk",
    dimenzije: ["240x290 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "240×290 cm" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["carsafi"],
      BOJA_PRIVREMENA,
      "240x290 cm",
      "/images/products/carsaf-1.webp"
    ),
    naStanju: true,
    kategorije: ["carsafi"],
  },
  {
    slug: "carsaf-na-gumu-bracni-220x240",
    naziv: "Čaršaf na gumu — bračni 220×240 cm",
    cijena: 14,
    materijal: "pamuk",
    dimenzije: ["220x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki: "", // TODO copy: aurelia-copywriter
    opisDugi: "", // TODO copy: aurelia-copywriter
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "220×240 cm" },
      { kljuc: "Tip", vrijednost: "Čaršaf na gumu (bračni)" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["carsafi"],
      BOJA_PRIVREMENA,
      "220x240 cm",
      "/images/products/carsaf-na-gumu-1.webp"
    ),
    naStanju: true,
    kategorije: ["carsafi"],
  },
];

export function getAllProducts(): Proizvod[] {
  return PROIZVODI;
}

export function getProductBySlug(slug: string): Proizvod | undefined {
  return PROIZVODI.find((proizvod) => proizvod.slug === slug);
}

export function getProductsByCategory(kategorija: string): Proizvod[] {
  return PROIZVODI.filter((proizvod) => proizvod.kategorije.includes(kategorija));
}
