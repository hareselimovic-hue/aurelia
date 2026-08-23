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
  /** Kratak tekst za "traku"/bedž u uglu kartice, npr. "Ušteda 15%" (korisnik, 23.08.2026 — set
   *  proizvodi). Opciono, generičko polje — nije vezano samo za popuste. */
  bedz?: string;
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
    cijena: 34.9,
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
    // zasebno kao svoj proizvod (vidi "carsaf-na-gumu-bracni-220x240" niže). Finalna prodajna
    // cijena (79,90 KM, korisnik 23.08.2026) potvrđena je nakon ove izmjene seta.
    naziv: "Posteljina od damasta — bračna (Slifer + 2 jastučnice)",
    cijena: 79.9,
    materijal: "pamučni damast",
    dimenzije: ["Slifer 200x200 cm", "jastučnica 50x70 cm (2 kom)"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Bračni set posteljine od 100% pamučnog damasta sa suptilnim žakardnim uzorkom. Sadrži Slifer (navlaku za poplun) 200×200 cm i dvije jastučnice 50×70 cm — dovoljno za dvoje. Tkanina ima blagi prirodan sjaj i gustu strukturu koja ne gubi oblik ni nakon čestih pranja.",
    opisDugi:
      "Bračna linija posteljine od damasta pravljena je za parove kojima jedna posteljina treba pokriti cijeli krevet bez kompromisa u veličini. Slifer, odnosno navlaka za poplun, ima dimenzije 200×200 cm — dovoljno platna da se poplun ne izvlači na ivicama ni nakon nemirnije noći. Uz njega dolaze dvije jastučnice od 50×70 cm, po jedna za svaku stranu kreveta, iste teksture i uzorka kao Slifer, pa cijeli set izgleda usklađeno na krevetu, ne kao sastavljen iz dijelova.\n\nMaterijal je 100% pamučni damast — žakardno tkanje kod kojeg se uzorak utkiva direktno u nit, a ne štampa naknadno na površinu, zbog čega se ne gubi ni nakon dugogodišnje upotrebe i čestog pranja. Tkanina ima gustu strukturu i blagi, prirodan sjaj koji je vidljiviji na većoj površini Slifera nego na manjim komadima, pa bračni set posebno dobro pokazuje kvalitet tkanja. Podnosi pranje do 95°C, što ostavlja prostor i za povremenu dezinfekciju posteljine, na primjer poslije bolesti u domaćinstvu.",
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
    cijena: 12.99,
    materijal: "pamuk",
    dimenzije: ["140x70 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Veći peškir od 100% pamuka, dimenzija 140×70 cm — dovoljno platna da se omota oko tijela poslije tuširanja ili kupanja. Gusto tkanje dobro upija vlagu i brzo se suši, a nakon nekoliko pranja postaje još mekši na dodir.",
    opisDugi:
      "Peškir 140×70 cm je veći format iz naše pamučne linije, napravljen za upotrebu poslije tuširanja ili kupanja — dovoljno velik da se njime omota tijelo, ne samo obriše. Tkan je od 100% pamuka gušće strukture, što znači bolju upijenost vlage u odnosu na tanje, jeftinije peškire koji vlagu samo razmazuju po površini.\n\nPamučno vlakno u ovoj gramaturi drži oblik i poslije čestog pranja, pa se peškir ne razvlači niti gubi debljinu kroz vrijeme kao sintetičke ili mješovite tkanine. Jedan peškir ove veličine obično je dovoljan po osobi za tuširanje, dok manji format bolje pokriva pranje lica i ruku tokom dana. Preporučujemo sušenje na zraku radi dužeg vijeka trajanja tkanine, iako podnosi i mašinsko sušenje na nižoj temperaturi.",
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
    cijena: 5.99,
    materijal: "pamuk",
    dimenzije: ["85x45 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Manji peškir od 100% pamuka, 85×45 cm, idealan za pranje lica i ruku ili uz umivaonik. Kompaktna veličina znači brže sušenje i lakše svakodnevno pranje. Ista gusta pamučna tkanina kao i veći peškir iz naše ponude, samo u praktičnijem formatu za čestu upotrebu.",
    opisDugi:
      "Peškir 85×45 cm je manji, praktičniji format namijenjen svakodnevnoj upotrebi uz umivaonik — za pranje lica, ruku ili kao dodatak većem peškiru za tijelo. Zbog manje površine suši se brže od velikih peškira, što je važno u kupatilima gdje visi na jednoj vješalici uz još nekoliko komada.\n\nIzrađen je od istog 100% pamuka gušće strukture kao i ostatak naše peškir linije, pa i pored manjih dimenzija zadržava dobru upijenost i mekoću na dodir. Kompaktna veličina ga čini pogodnim i za putovanja ili za držanje u kuhinji, ne samo u kupatilu. Kao i kod ostalih pamučnih artikala u ponudi, boja i tekstura se najbolje čuvaju pranjem na umjerenoj temperaturi, a povremeno pranje na višoj temperaturi koristi za temeljitije čišćenje.",
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
    slug: "stopa-za-noge",
    // NAPOMENA: dimenzija (50×70 cm) je i dalje procjena (korisnik nije potvrdio) — cijena je
    // potvrđena (korisnik, 23.08.2026: nabavna 6 KM, prodajna 7,90 KM).
    naziv: "Stopa za noge 50×70 cm",
    cijena: 7.9,
    materijal: "pamuk",
    dimenzije: ["50x70 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Mekana pamučna stopa za noge, 50×70 cm, za ispred kade, tuš kabine ili umivaonika. Gusto tkanje upija vodu s tabana i brzo se suši, a debljina daje ugodan, mekan oslonac na hladnom podu kupatila.",
    opisDugi:
      "Stopa za noge je praktičan dodatak kupatilu koji rješava mokar i hladan pod odmah poslije tuširanja ili kupanja — postavlja se ispred kade, tuš kabine ili umivaonika. Izrađena je od 100% pamuka, iste porodice materijala kao i peškiri u našoj ponudi, pa upija vlagu umjesto da je razmazuje po podu.\n\nGusto tkanje daje stopi dovoljno debljine da bude ugodna za bosu nogu, a istovremeno se brzo suši između upotreba, što je važno u manjim kupatilima bez dobre ventilacije. Dimenzija 50×70 cm pokriva prostor ispred većine kada i tuš kabina bez da zauzima previše poda. Pere se na isti način kao i ostali pamučni tekstil u ponudi — redovno pranje na umjerenoj temperaturi čuva mekoću i upijenost duže vrijeme.",
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamuk" },
      { kljuc: "Dimenzije", vrijednost: "50×70 cm" },
    ],
    slike: generisiSlike(
      "pamuk",
      ["peskiri", "stopa-za-noge"],
      BOJA_PRIVREMENA,
      "50x70 cm",
      "/images/products/stopa-za-noge-1.webp"
    ),
    naStanju: true,
    kategorije: ["peskiri", "stopa-za-noge"],
  },
  {
    slug: "carsaf-160x240",
    naziv: "Čaršaf 160×240 cm",
    cijena: 20.9,
    materijal: "pamuk",
    dimenzije: ["160x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Čaršaf od 100% pamuka, 160×240 cm, za jednostruki krevet s dušekom do oko 150 cm širine. Klasičan ravni čaršaf bez gume — prostire se preko dušeka i pokriva ga sa svih strana. Gusto pamučno tkanje, prijatno na dodir i izdržljivo na česta pranja.",
    opisDugi:
      "Čaršaf 160×240 cm je klasičan, ravni čaršaf namijenjen jednostrukim krevetima s dušekom do otprilike 150 cm širine. Nema elastičan rub kao verzija na gumu — prostire se preko dušeka i pokriva ga sa dovoljno viška platna da se krajevi mogu uvući ispod dušeka po želji.\n\nTkan je od 100% pamuka, iste porodice materijala kao i ostatak naše čaršaf linije, tako da ravnomjerno upija vlagu tokom noći i ostaje prijatan na dodir u svim godišnjim dobima. Za razliku od gušće, sjajnije teksture pamučnog damasta koji koristimo za posteljinu, čaršaf ima glađu, laganiju površinu prilagođenu direktnom kontaktu s kožom. Podnosi česta pranja bez gubitka čvrstoće, a ravni krojevi poput ovog lakše se peglaju od varijanti na gumu jer nemaju šavove po uglovima.",
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
    cijena: 24.9,
    materijal: "pamuk",
    dimenzije: ["220x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Čaršaf od 100% pamuka, 220×240 cm, za bračni krevet s dušekom do oko 200 cm širine. Ravni kroj bez gume, dovoljno platna za udoban preklop sa svih strana. Ista kvalitetna pamučna tkanina kao i ostali čaršafi u ponudi.",
    opisDugi:
      "Čaršaf 220×240 cm napravljen je za bračne krevete s dušekom širine do otprilike 200 cm — dovoljno platna da pokrije dušek sa svih strana i ostavi višak za udoban preklop, bez da krajevi jedva dohvate ivicu. Kao ravni čaršaf, bez elastičnog ruba, lakše ga je poravnati na dušecima nestandardnih dimenzija nego fiksnu varijantu na gumu.\n\nMaterijal je 100% pamuk, tkan gušće nego kod jeftinijih čaršafa, pa se manje gužva i duže zadržava svježinu tokom noći. Ako vam je važnije da se čaršaf ne pomjera dok spavate, u ponudi postoji i verzija iste dimenzije s elastičnim rubom — čaršaf na gumu za bračni krevet. Ova, ravna verzija je praktičnija za smjenu posteljine i lakše se pegla i skladišti jer nema oblikovane uglove.",
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
    cijena: 27.9,
    materijal: "pamuk",
    dimenzije: ["240x290 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Čaršaf od 100% pamuka, veće, produžene dimenzije 240×290 cm — za bračne krevete i dušeke koji su duži ili širi od standarda. Ravni kroj, dovoljno platna za pokrivanje i preklop sa svih strana. Praktičan izbor kad standardna dimenzija od 220×240 cm nije dovoljno velika.",
    opisDugi:
      "Čaršaf 240×290 cm je naša najveća, produžena varijanta, namijenjena bračnim krevetima i dušecima koji su duži ili širi od standardne bračne mjere. Ako vam je dušek nestandardne veličine — na primjer produženi krevet ili deblji dušek kojem treba više viška platna za preklop — ovo je dimenzija koja to rješava bez stiskanja na uglovima.\n\nKao i ostali čaršafi u ponudi, tkan je od 100% pamuka, dovoljno guste strukture da izdrži redovno pranje i svakodnevnu upotrebu bez brzog habanja. Veća površina znači i više platna za uvlačenje ispod dušeka, što čaršaf drži urednijim tokom noći i pored toga što nema elastičan rub. Prije kupovine izmjerite dušek, ne samo krevet — širinu, dužinu i visinu (debljinu) dušeka — jer je upravo ta razlika između standardne bračne i produžene dimenzije razlog zašto ova veća varijanta postoji u ponudi.",
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
    cijena: 18,
    materijal: "pamuk",
    dimenzije: ["220x240 cm"],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Čaršaf na gumu za bračni krevet, 220×240 cm, od 100% pamuka. Elastični rub oko cijelog oboda drži čaršaf zategnutim preko dušeka cijelu noć, bez pomjeranja i nabora. Praktičniji za svakodnevno namještanje kreveta od ravnog čaršafa.",
    opisDugi:
      "Čaršaf na gumu za bračni krevet rješava ono što je kod ravnih čaršafa najveća gnjavaža — pomjeranje tokom noći. Elastični rub našiven je oko cijelog oboda čaršafa, oblikovan da obuhvati uglove dušeka i drži platno zategnutim koliko god se okretali u snu.\n\nDimenzija 220×240 cm namijenjena je bračnim dušecima do oko 200 cm širine, a elastika daje dodatnih nekoliko centimetara prostora za deblje dušeke koje ravni čaršaf teže pokrije. Materijal je 100% pamuk, isti kao kod ostalih čaršafa u ponudi, pa nema razlike u udobnosti ili prozračnosti u odnosu na ravnu verziju — razlika je isključivo u kroju i praktičnosti namještanja. Zahvaljujući oblikovanim uglovima, stavljanje i skidanje čaršafa traje kraće nego kod ravnog čaršafa, što ovu varijantu čini praktičnim izborom za domaćinstva koja često mijenjaju posteljinu ili imaju djecu.",
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
  {
    slug: "puni-set-posteljine-jednostruki",
    // Set proizvod (korisnik, 23.08.2026): 2× uska linija posteljina + guma + 2× veliki peškir +
    // 2× mali peškir + stopa za noge. Cijena = zbir pojedinačnih cijena (133,66 KM po tada važećim
    // cijenama) uz 15% popusta = 113,61 KM. `cijenaStara` nosi zbir (postojeći mehanizam za
    // precrtanu cijenu, KarticaProizvoda već to renderuje), `bedz` nosi traku "Ušteda 15%".
    naziv: "Puni set posteljine — jednostruki krevet",
    cijena: 113.61,
    cijenaStara: 133.66,
    bedz: "Ušteda 15%",
    materijal: "pamučni damast",
    dimenzije: [
      "Slifer 140×200 cm (2×)",
      "Čaršaf na gumu 220×240 cm",
      "Peškir 140×70 cm (2×)",
      "Peškir 85×45 cm (2×)",
      "Stopa za noge 50×70 cm",
    ],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Kompletan set za dva jednostruka kreveta po cijeni nižoj 15% od pojedinačne kupovine: 2 posteljine od damasta (Slifer + jastučnica), čaršaf na gumu, 2 velika i 2 mala peškira i stopa za noge. Sve što treba za opremanje kreveta i kupatila u jednoj narudžbi.",
    opisDugi:
      "Ovaj set je sastavljen za sve koji odjednom opremaju dva jednostruka kreveta — bilo da je riječ o gostinjskoj sobi, apartmanu za iznajmljivanje ili jednostavno želji da se ne naručuje deset puta zaredom. Sadrži dvije posteljine od pamučnog damasta (svaka Slifer 140×200 cm + 1 jastučnica), jedan čaršaf na gumu 220×240 cm, dva velika peškira 140×70 cm, dva mala peškira 85×45 cm i jednu stopu za noge 50×70 cm.\n\nKupljeno pojedinačno, ovih devet komada koštalo bi 133,66 KM — u ovom setu je 113,61 KM, 15% jeftinije. Materijal je isti kao i kod pojedinačnih artikala: pamučni damast za posteljine, 100% pamuk za čaršaf, peškire i stopu, pa nema kompromisa u kvalitetu zarad cijene. Posebno je praktičan za vlasnike apartmana i kratkoročni najam — jedna narudžba pokriva kompletnu smjenu tekstila za dva kreveta i kupatilo, umjesto sastavljanja iz više zasebnih artikala.",
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamučni damast + 100% pamuk (čaršaf/peškiri/stopa)" },
      {
        kljuc: "Set sadrži",
        vrijednost:
          "2× posteljina uska linija (Slifer 140×200 + jastučnica), čaršaf na gumu 220×240, 2× peškir 140×70, 2× peškir 85×45, stopa za noge 50×70",
      },
      { kljuc: "Ušteda", vrijednost: "15% u odnosu na pojedinačnu kupovinu (133,66 → 113,61 KM)" },
    ],
    slike: generisiSlike(
      "pamučni damast",
      ["posteljina", "damast", "set"],
      BOJA_PRIVREMENA,
      "140x200 cm",
      "/images/products/damast-uska-linija-1.webp"
    ),
    naStanju: true,
    kategorije: ["posteljina", "damast", "set"],
  },
  {
    slug: "puni-set-posteljine-bracni",
    // Set proizvod (korisnik, 23.08.2026): bračna posteljina + guma + 2× veliki peškir + 2× mali
    // peškir + stopa za noge. Zbir pojedinačnih cijena 143,76 KM, 15% popusta = 122,20 KM.
    naziv: "Puni set posteljine — bračni krevet",
    cijena: 122.2,
    cijenaStara: 143.76,
    bedz: "Ušteda 15%",
    materijal: "pamučni damast",
    dimenzije: [
      "Slifer 200×200 cm",
      "Jastučnica 50×70 cm (2 kom)",
      "Čaršaf na gumu 220×240 cm",
      "Peškir 140×70 cm (2×)",
      "Peškir 85×45 cm (2×)",
      "Stopa za noge 50×70 cm",
    ],
    boja: BOJA_PRIVREMENA,
    opisKratki:
      "Kompletan set za bračni krevet po cijeni nižoj 15% od pojedinačne kupovine: bračna posteljina od damasta (Slifer + 2 jastučnice), čaršaf na gumu, 2 velika i 2 mala peškira i stopa za noge. Jedna narudžba za cijelu spavaću sobu i kupatilo.",
    opisDugi:
      "Set je sastavljen za bračni krevet i kupatilo uz njega, bez potrebe da se svaki komad naručuje posebno. Sadrži bračnu posteljinu od pamučnog damasta (Slifer 200×200 cm + 2 jastučnice 50×70 cm), čaršaf na gumu 220×240 cm koji drži dušek prekriven cijelu noć, dva velika peškira 140×70 cm, dva mala peškira 85×45 cm i jednu stopu za noge 50×70 cm.\n\nPojedinačno, ovih sedam komada koštalo bi 143,76 KM — u setu je 122,20 KM, 15% jeftinije. Isti materijal kao i zasebni artikli: pamučni damast za posteljinu, 100% pamuk za ostatak seta. Ovakav set je posebno koristan vlasnicima apartmana i kratkoročnog najma koji opremaju bračnu spavaću sobu odjednom — pokriva krevet, čaršaf i kupatilski tekstil u jednoj narudžbi, spreman za useljenje ili prvog gosta.",
    specifikacije: [
      { kljuc: "Materijal", vrijednost: "100% pamučni damast + 100% pamuk (čaršaf/peškiri/stopa)" },
      {
        kljuc: "Set sadrži",
        vrijednost:
          "Posteljina bračna (Slifer 200×200 + 2 jastučnice), čaršaf na gumu 220×240, 2× peškir 140×70, 2× peškir 85×45, stopa za noge 50×70",
      },
      { kljuc: "Ušteda", vrijednost: "15% u odnosu na pojedinačnu kupovinu (143,76 → 122,20 KM)" },
    ],
    slike: generisiSlike(
      "pamučni damast",
      ["posteljina", "damast", "set", "bracna"],
      BOJA_PRIVREMENA,
      "200x200 cm",
      "/images/products/damast-bracna-1.webp"
    ),
    naStanju: true,
    kategorije: ["posteljina", "damast", "set", "bracna"],
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
