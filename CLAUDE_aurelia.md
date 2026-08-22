# Web shop — posteljina (BiH)

Kontekst projekta za Claude Code. Pročitaj cijeli fajl prije prve izmjene.

---

## 1. Šta gradimo

E-commerce sajt za prodaju posteljine na tržištu Bosne i Hercegovine.

| | |
|---|---|
| Tržište | Bosna i Hercegovina |
| Jezik | bosanski (`lang="bs"`) |
| Valuta | BAM, prikaz kao `49,90 KM` (zarez kao decimalni separator) |
| Obim faze 1 | 15 proizvoda |
| Primarni SEO cilj | keyword **posteljina** (880 pretraga/mj, KD 19%) |

**Faza 1 = 2 template-a i 1 komponenta.** Početna stranica, shop stranica, kartica proizvoda. Sve ostalo se gradi na to.

### Popuni prije početka

```
DOMENA:        _______.ba
NAZIV BRENDA:  _______
STACK:         _______   (npr. Next.js App Router + Tailwind)
CMS/DATA:      _______   (npr. lokalni JSON, Sanity, WooCommerce)
```

Ako stack nije zadan, predloži ga prije pisanja koda i sačekaj potvrdu.

---

## 2. Arhitektura stranica

```
/                              POČETNA — target keyword "posteljina"
/shop/                         SHOP — katalog sa filterima
/shop/[slug]/                  15 proizvodnih stranica
/o-nama/
/kontakt/
/dostava-i-placanje/
/reklamacije-i-povrat/
/uslovi-koristenja/
/politika-privatnosti/
```

**Faza 2 (ne graditi sada):** `/shop/pamucna-posteljina/`, `/shop/djecija-posteljina/`, `/shop/posteljina-za-bebe/`, `/blog/`

### Dva pravila koja se ne krše

1. **Nema zasebne `/posteljina/` stranice.** Sa 15 proizvoda početna JESTE glavna kategorija. Zasebna stranica bi kanibalizirala početnu za isti keyword.
2. **Početna i shop moraju biti različite.** Isti proizvodi, ali različit `<h1>`, različit `<title>`, i potpuno različit SEO tekst. Početna objašnjava *kako odabrati*, shop objašnjava *šta imamo u ponudi*. Ako se tekstovi preklapaju, obje stranice gube.

### URL pravila

- mala slova, crtica kao separator
- bez dijakritike: `pamucna-posteljina`, ne `pamučna-posteljina`
- bez ID brojeva u slugu
- trailing slash konzistentno kroz cijeli sajt

---

## 3. Model podataka — proizvod

Minimalni shape koji svaki proizvod mora imati. Svi template-i se pišu prema ovome.

```ts
type Proizvod = {
  slug: string;              // "pamucna-posteljina-aurora"
  naziv: string;             // "Pamučna posteljina Aurora 200x200"
  cijena: number;            // 49.90
  cijenaStara?: number;      // za prikaz sniženja
  materijal: "pamuk" | "ranforce" | "saten" | "mikrofiber";
  dimenzije: string[];       // ["140x200", "160x200", "200x200"]
  boja: string;
  opisKratki: string;        // ~50 riječi, ide iznad preloma
  opisDugi: string;          // 150–250 riječi, JEDINSTVEN za svaki proizvod
  specifikacije: { kljuc: string; vrijednost: string }[];
  slike: { url: string; alt: string }[];  // min 4, prva je glavna
  naStanju: boolean;
  kategorije: string[];      // ["pamucna", "bracna"] — za filtere u fazi 1
};
```

**Alt tekst se generiše iz atributa, nikad iz imena fajla.**
Šablon: `"{materijal} posteljina {boja} {dimenzija}"` → `"pamučna posteljina bijela 200x200"`

---

## 4. POČETNA STRANICA

```
URL:    /
H1:     Posteljina
Title:  Posteljina — online prodaja posteljine | [Brend].ba
Meta:   Kvalitetna posteljina za bračni i jednostruki krevet. Dostava
        po cijeloj BiH, plaćanje pouzećem, zamjena u 14 dana.
```

Blokovi idu tačno ovim redom:

### 01 — Header (dijeljena komponenta)
Logo (link na `/`) · navigacija · pretraga · korpa · telefon.
- Navigacija maksimalno 5 stavki: Početna, Shop, O nama, Kontakt
- Logo je `<img>` sa `alt="[Brend] posteljina"`, ne CSS background
- Telefon na mobilnom kao `tel:` link

### 02 — Hero
Statična slika + `<h1>` + podnaslov + jedno CTA dugme.
- **Bez slidera.** Slider ubija LCP, a slajd 2 i 3 niko ne vidi.
- Podnaslov mora prirodno sadržati: *posteljina*, *pamuk*, *dostava BiH*
- CTA vodi na `/shop/`
- Hero slika je LCP element: WebP, < 150 KB, `fetchpriority="high"`, **bez** `loading="lazy"`

### 03 — Trust traka
4 ikonice u redu: Dostava po cijeloj BiH · Plaćanje pouzećem · Zamjena u 14 dana · 100% pamuk
- Tekst mora biti pravi HTML, ne slika

### 04 — Kupuj po vrsti
`<h2>Kupuj po vrsti</h2>` — 4 do 6 kartica.
- U fazi 1 vode na filtriranu shop stranicu: `/shop/?materijal=pamuk`
- Anchor tekst je keyword: „Pamučna posteljina", „Dječija posteljina", „Bračna posteljina 200x200"
- Kartica ima vidljiv tekstualni naslov, ne samo sliku

### 05 — Svih 15 proizvoda
`<h2>Naša posteljina</h2>` — grid 4 kolone desktop / 2 mobilni.
- **Svih 15 renderovano u HTML-u odmah.** Bez „učitaj još", bez paginacije, bez client-side fetcha.
- Prvih 8 slika bez lazy-loada, ostatak `loading="lazy"`
- Naziv proizvoda je `<h3>` i ujedno link

### 06 — Zašto kod nas
`<h2>` + 3–4 kratka bloka: rok i cijena dostave, postupak zamjene, ko stoji iza shopa.

### 07 — SEO tekst
400–600 riječi, **ispod grida proizvoda** — korisnik prvo mora vidjeti robu.
```
<h2>Kako odabrati posteljinu</h2>
  <h3>Materijali — pamuk, ranforce, saten</h3>
  <h3>Dimenzije — 140x200, 160x200, 200x200</h3>
  <h3>Održavanje i pranje</h3>
```
- 3 do 5 internih linkova na proizvode, prirodno u rečenici
- Piši za čovjeka koji bira posteljinu. Nabijanje keyworda ovdje šteti.

### 08 — FAQ
`<h2>Česta pitanja</h2>` — 5–6 pitanja u accordionu.
- **Odgovori moraju biti u HTML-u i kada je accordion zatvoren.** Skrivanje CSS-om (`max-height`, `hidden`), nikad JS koji ubacuje sadržaj na klik — Google ne vidi ono što ne postoji u DOM-u.
- Teme: dimenzije za bračni krevet, rok dostave, sastav materijala, zamjena veličine, način plaćanja, skupljanje nakon pranja

### 09 — Recenzije
Komponenta se pravi, ali ostaje prazna do prvih narudžbi.
- **Ne generisati lažne recenzije i ne dodavati `AggregateRating` schema bez stvarnih ocjena.**

### 10 — Footer (dijeljena komponenta)
4 kolone: podaci o firmi (u `<address>`) · linkovi na kategorije · pravne stranice · društvene mreže.

---

## 5. SHOP STRANICA

```
URL:    /shop/
H1:     Posteljina — cijela ponuda
Title:  Posteljina — svi modeli i dimenzije | [Brend].ba
Meta:   Pregledaj cijelu ponudu posteljine: pamuk, ranforce, saten.
        Dimenzije 140x200 do 200x200. Dostava po BiH.
```

### 01 — Breadcrumb
`Početna › Shop` + `BreadcrumbList` schema

### 02 — Naslov i uvod
`<h1>` + 60–100 riječi: broj artikala, raspon cijena, glavni materijali.

### 03 — Filteri i sortiranje — tehnički najosjetljiviji dio

Sidebar na desktopu, drawer na mobilnom. Filteri: materijal, dimenzija, boja, cijena. Sortiranje: novo, cijena ↑, cijena ↓.

**Obavezno:**
- Filteri rade preko URL parametara (`/shop/?materijal=pamuk`), ne preko JS state-a bez promjene URL-a
- Svaka filtrirana varijanta nosi `<link rel="canonical" href="https://domena.ba/shop/">`
- Kombinacije dva ili više filtera: `<meta name="robots" content="noindex,follow">`
- Sortiranje **uvijek** noindex

Bez ovoga 4 filtera naprave stotine indeksiranih duplikata iste stranice i cijeli sajt gubi na kvalitetu u Google-ovim očima.

### 04 — Grid
Ista `KarticaProizvoda` komponenta kao na početnoj. Sve na jednoj stranici.
Kada asortiman pređe 24 artikla → paginacija kao `/shop/stranica/2/`, ne `?page=2`.

### 05 — SEO tekst — mora biti drugačiji od početne
300–400 riječi.
```
<h2>Šta se nalazi u ponudi</h2>
<h2>Tabela dimenzija — koja veličina za koji krevet</h2>
```
Tabela dimenzija je dobar kandidat za featured snippet u Google-u. Napravi je kao pravi `<table>`.

### 06 — Footer
Ista komponenta.

---

## 6. Kartica proizvoda (dijeljena komponenta)

Jedna komponenta, koristi se na početnoj, shopu i u „slični proizvodi".

```
[ slika 3:4 ]
[ naziv — <h3>, link ]
[ 49,90 KM ]
[ 100% pamuk · 200x200 ]
[ Dodaj u korpu ]
```

- Cijena vidljiva bez klika — uslov za Google Shopping i za konverziju
- Cijena u `KM`, nikad `€` ili `$`
- `alt` se generiše iz atributa proizvoda

---

## 7. Proizvodna stranica — skica

Ne razrađuje se u detalje sada, ali ruta i skelet se postavljaju odmah:

```
Breadcrumb → Galerija (min 4 slike) → <h1> puni naziv → cijena
→ izbor dimenzije → Dodaj u korpu → kratak opis (~50 riječi)
→ tabela specifikacija → duži opis (150–250 riječi)
→ dostava i povrat → recenzije → slični proizvodi (4)
```

**Najveća greška koju treba izbjeći:** kopiranje opisa od dobavljača. Tih 15 opisa moraju biti napisani iz nule, svaki drugačiji. To je jedina stvar koja razlikuje ovaj shop od pet drugih koji prodaju identičan artikal.

---

## 8. Interno linkovanje

| Sa | Na | Anchor |
|---|---|---|
| Hero CTA | `/shop/` | Pogledaj ponudu |
| Kartice vrsta | `/shop/?filter` | Pamučna posteljina, Dječija posteljina |
| Grid (početna i shop) | proizvodi | puni naziv proizvoda |
| SEO tekst | 3–5 proizvoda | prirodno u rečenici |
| Proizvod | 4 slična | puni naziv proizvoda |
| Footer | glavne stranice | naziv stranice |

**Pravilo:** svaki proizvod dostupan u maksimalno 2 klika od početne.

---

## 9. Schema markup (JSON-LD u `<head>`)

| Stranica | Tipovi |
|---|---|
| Početna | `Organization` (ili `Store`), `WebSite` + `SearchAction`, `ItemList` (15 proizvoda), `FAQPage` |
| Shop | `CollectionPage`, `BreadcrumbList`, `ItemList` |
| Proizvod | `Product` + `Offer`, `BreadcrumbList` |

`Offer` mora imati `priceCurrency: "BAM"` i `availability`.
Ne dodavati `AggregateRating` dok nema stvarnih recenzija.

---

## 10. Tehnički zahtjevi

**Blokirajuće — ništa se ne deploya bez ovoga:**
- `lang="bs"` na `<html>`
- HTTPS na cijelom sajtu, bez mixed contenta
- Jedna verzija domene (www ili bez), 301 na drugu
- Canonical na svakoj stranici
- Jedan `<h1>` po stranici
- Alt tekst na svakoj slici
- XML sitemap + `robots.txt`
- Cijene isključivo u KM

**Performanse:**
- LCP < 2,5 s na mobilnom
- Sve slike WebP, < 200 KB
- Bez blokirajućeg JS-a iznad preloma
- Hero slika preload, ostalo lazy

**Prije lansiranja:**
- Google Search Console + Analytics
- 404 stranica sa linkom na shop
- Google Business profil (ako postoji fizička lokacija)

---

## 11. Konvencije koda

- Komponente i tekst u kodu na engleskom, **sav sadržaj vidljiv korisniku na bosanskom**
- Semantički HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<address>`
- Heading hijerarhija bez preskakanja nivoa (h1 → h2 → h3)
- Formatiranje cijene ide kroz jedan helper (`formatPrice`), nigdje hardkodirano
- Meta podaci se definišu po ruti, ne globalno

---

## 12. Roadmap

| Faza | Šta | Zašto |
|---|---|---|
| **1 — sada** | Početna + shop + 15 proizvodnih sa originalnim opisima | Bez ovoga nema ničega |
| **2 — 1–2 mj** | Kategorije `/posteljina-za-bebe/` i `/djecija-posteljina/` kada svaka ima 4+ artikla | KD 11% na oba upita — najlakše pozicije u niši |
| **3 — 2–4 mj** | Blog: dimenzije posteljine, pamuk vs ranforce, kako oprati posteljinu | Informativni promet + interni linkovi na proizvode |
| **4 — 3–6 mj** | Lokalni backlinkovi, Google Business, recenzije kupaca | Autoritet — jedino što fali da se prestignu mali konkurenti |

**Kategorija se otvara tek na 4+ proizvoda.** Ispod toga je thin content i Google je tretira kao duplikat.

---

## 13. Konkurencija

Prva strana za „posteljina" u BiH: jysk.ba, daphne.ba, ikea.com, sinsay.com, posteljine-in.ba, posteljina.hr, posteljine.ba, aksabih.ba, ananas.ba, textil.ba.

Pozicije 5–8 drže mali specijalizirani shopovi — to znači da je top 10 realan sa 15 proizvoda i čistim tehničkim setupom, a top 5 sa nešto backlinkova. Brži promet dolazi preko `posteljina za bebe` (260/mj, KD 11%) i `djecija posteljina` (210/mj, KD 11%).

---

## 14. Definicija gotovog — faza 1

- [ ] Početna: svih 10 blokova, 15 proizvoda u HTML-u
- [ ] Shop: filteri preko URL-a, canonical i noindex pravila postavljena
- [ ] 15 proizvodnih stranica sa jedinstvenim opisima
- [ ] Kartica proizvoda kao jedna dijeljena komponenta
- [ ] SEO tekst na početnoj i shopu — različit sadržaj
- [ ] JSON-LD na sve tri vrste stranica, validiran u Rich Results Test
- [ ] Lighthouse mobile: Performance 90+, SEO 100
- [ ] Sitemap generisan, `robots.txt` postavljen
- [ ] Sve cijene u KM, sve slike sa alt tekstom
