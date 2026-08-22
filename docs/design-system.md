# Design system — Aurelia

Status: Faza B — konkretan, implementabilan dizajn sistem (nakon research brief-a u `research-brief.md`).
Ovaj dokument je referenca za `aurelia-frontend` i sve buduće agente. Sve što je ovdje opisano je već
upisano u kod: `src/app/globals.css` (paleta, tipografske skale, radius) i `src/app/layout.tsx` (next/font
import). Ne treba nagađati vrijednosti — kopirati Tailwind klase odavde.

---

## 1. Paleta boja

Pravac: **The White Company / Brooklinen**, ne Frette (previše hladno) ni lokalna budžetska konkurencija
(previše jarko/popust-crveno). Sve boje su tople (topli oklch hue ~61-87°, nikad neutralno siva sa hue 0),
pozadina nikad čisto `#FFFFFF`, akcent nikad sjajni metalik gradient.

| Token (CSS var / Tailwind) | Hex | OKLCH | Upotreba | Zašto |
|---|---|---|---|---|
| `--background` / `bg-background` | `#FAF6F0` | `oklch(0.975 0.009 78.3)` | Pozadina cijelog sajta | Topli ivory, ne sterilno bijelo — "meko" iz brief-a |
| `--foreground` / `text-foreground` | `#2A2521` | `oklch(0.269 0.010 61.0)` | Osnovni tekst | Topao tamni charcoal umjesto čiste crne — mekši kontrast |
| `--card` / `bg-card` | `#FFFDFA` | `oklch(0.995 0.005 78.3)` | Kartice proizvoda, popover | Blago svjetlije od pozadine → lagani "lift" bez sjenke |
| `--primary` / `bg-primary`, `text-primary` | `#8A6634` | `oklch(0.536 0.081 73.6)` | CTA dugmad, linkovi, aktivna stanja | Prigušena antikna bronza/zlato — jedina asocijacija na ime "Aurelia" koja ostaje mirna, ne kič. Kontrast 4.88:1 na `primary-foreground` (WCAG AA) |
| `--primary-foreground` | `#FBF7F0` | `oklch(0.977 0.010 81.8)` | Tekst na primary dugmetu | |
| `--secondary` / `bg-secondary` | `#F1EAE0` | `oklch(0.940 0.015 77.1)` | Sekundarna dugmad, chip-ovi, alt pozadine | Lan/bež |
| `--muted` / `bg-muted` | `#F5F0E8` | `oklch(0.957 0.012 79.8)` | Trust traka, naizmjenične sekcije, placeholder slika | Blijedi pijesak |
| `--muted-foreground` / `text-muted-foreground` | `#7C7266` | `oklch(0.558 0.022 72.4)` | Sekundarni tekst (materijal · dimenzije na kartici, opisi) | Topli taupe, kontrast 4.38:1 na pozadini |
| `--accent` / `bg-accent` | `#EFE2C5` | `oklch(0.916 0.041 86.7)` | Hover stanja, ikonice, tanke linije, "Novo" bedž | **Vrlo blijed champagne** — koristi se suzdržano, nikad kao velika površina (pravilo iz brief-a) |
| `--destructive` / sniženje | `#B2593B` | `oklch(0.566 0.124 39.1)` | Sniženje (nova cijena/bedž), greška forme | Prigušena **terakota**, ne agresivna crvena — usklađena s toplom paletom (brief eksplicitno traži ovo umjesto Daphne/Sinsay crvene) |
| `--border` / `border-border` | `#E7DFD3` | `oklch(0.907 0.018 78.2)` | Linije, okviri kartica | Topla linena linija, ne siva |
| `--ring` | `#B08D55` | `oklch(0.664 0.085 78.2)` | Focus outline | Vidljiv, u tonu bronze |

**Kontrast provjere (WCAG AA, izračunato):**
`foreground/background` 14.08:1 · `primary-foreground/primary` 4.88:1 · `accent-foreground/accent` 8.43:1 ·
`secondary-foreground/secondary` 9.96:1 · `muted-foreground/background` 4.38:1 · `destructive-foreground/destructive` 4.55:1.
Sve prolaze AA za normalan tekst (≥4.5:1) ili veći tekst (≥3:1).

**Izbjegnuto (namjerno):** jarka plava/narandžasta/crvena kao brend boja (Sinsay/ananas.ba/textil.ba teritorija),
hladna korporativna plava (JYSK), sjajni/metalik zlatni gradient (kič), popust-crvena kao dominantan element kartice.

**Tamni mod:** definisan u `.dark` bloku (usklađen s toplom paletom umjesto shadcn zadane sive), ali **nije
prioritet faze 1** — shop mora biti svijetao po pravilu iz research brief-a (§2: nijedan konkurent ne koristi
tamnu pozadinu za shop). Rezervisano za eventualni budući admin panel.

### Radius
`--radius` podignut sa `0.625rem` na **`0.75rem`** (12px) — mekši, "boutique" osjećaj bez pretjeranog
zaobljenja. `rounded-lg` (kartice, dugmad), `rounded-xl`/`rounded-2xl` (hero slika, veliki blokovi).

---

## 2. Tipografija

**Naslovni font: Fraunces** (serif, varijabilan, topao/mekan rez — ne oštar/geometrijski) — Daphne i Frette
oboje koriste tanku, mirnu tipografiju za premium efekat; Fraunces daje isti osjećaj bez hladnoće Frette-a.
**Tekstualni font: DM Sans** (humanistička grotesk, čitljiva, topla) — nosi UI, cijene, opise, meta tekst.

Oba fonta uvezena preko `next/font/google` u `src/app/layout.tsx`, subset **`["latin", "latin-ext"]`**
(latin-ext je obavezan — bez njega č/ć/š/ž/đ ne renderuju ispravno, vidi projektnu memoriju o dijakritici).

```ts
// src/app/layout.tsx
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
```

`globals.css` mapira `--font-sans` → DM Sans i `--font-heading` → Fraunces, pa su Tailwind klase
`font-sans` i `font-heading` odmah upotrebljive svugdje.

### Skala

| Nivo | Tag / upotreba | Tailwind klasa (već u `@layer base`, nije potrebno pisati ručno na `<h1-h3>`) | Veličina | Weight | Line-height |
|---|---|---|---|---|---|
| Display / H1 | Hero naslov, `<h1>` početne | `font-heading text-4xl md:text-6xl font-normal tracking-tight` | 36px → 60px | 400 | 1.1 |
| H2 | Naslovi sekcija ("Naša posteljina", "Kako odabrati posteljinu") | `font-heading text-3xl md:text-4xl font-normal tracking-tight` | 30px → 36px | 400 | 1.15 |
| H3 | Podnaslovi, naziv proizvoda na kartici, FAQ pitanja | `font-heading text-xl md:text-2xl font-medium` | 20px → 24px | 500 | 1.3 (snug) |
| Body-lg (lead) | Uvodni pasus, hero podnaslov | `font-sans text-lg leading-relaxed text-foreground` | 18px | 400 | 1.65 |
| Body | Standardni tekst, opisi | `font-sans text-base leading-relaxed text-foreground` | 16px | 400 | 1.6 |
| Small | Meta info ("100% pamuk · 200x200"), footer, fusnote | `font-sans text-sm text-muted-foreground` | 14px | 400 | 1.5 |
| Eyebrow / label | Trust traka, kategorije, bedževi (`.text-eyebrow` utility) | `font-sans text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground` | 12px | 600 | — |
| Cijena (kartica) | Cijena na kartici proizvoda | `font-sans text-lg font-semibold text-foreground` | 18px | 600 | — |
| Cijena (proizvod) | Cijena na proizvodnoj stranici | `font-sans text-2xl font-semibold text-foreground` | 24px | 600 | — |

**Pravilo:** naslovi (Fraunces) idu maksimalno do weight `600`, nikad `700+` — izbjeći fast-fashion bold
(Sinsay stil, eksplicitno zabranjeno u research brief-u). Za "premium bez skupog utiska" koristiti weight
`300`-`400` na velikim naslovima (hero H1) i `500`-`600` samo na manjim (H3, kartica).
Fraunces italic (`style: italic`, weight 400) je dostupan za suptilan romantičan akcenat (npr. citat, jedna
riječ u hero naslovu) — koristiti rijetko, ne kao pravilo.

---

## 3. Spacing / layout tokeni

| Token | Vrijednost | Upotreba |
|---|---|---|
| Kontejner | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Sav glavni sadržaj (header, sekcije, footer) |
| Sekcija (standard) | `py-16 md:py-24` | Razmak između glavnih blokova početne/shop stranice (Hero, Trust, Kupuj po vrsti, Grid, Zašto kod nas, SEO tekst, FAQ) — **dosljedno kroz cijeli sajt**, ne variraj ručno |
| Sekcija (kompaktna) | `py-8 md:py-12` | Trust traka, breadcrumb red, uže podsekcije |
| Grid razmak (proizvodi) | `gap-6 md:gap-8` | Grid kartica — 2 kolone mobilni, 4 desktop (`grid-cols-2 md:grid-cols-4`), po §5 CLAUDE_aurelia.md |
| Kartica unutrašnji padding | `p-4` (`gap-1.5` između elemenata) | Sadržaj kartice proizvoda ispod slike |
| Vertikalni ritam teksta | `space-y-4` (paragraf-nivo), `space-y-2` (naslov+podnaslov) | SEO tekst, opisi |
| Radius | `rounded-lg` kartice/dugmad, `rounded-xl` hero/veliki blokovi, `rounded-full` pill bedževi | vidi §1 |

---

## 4. Ključne komponente

### 4.1 Dugme (Button)

Bazira se na postojećem `src/components/ui/button.tsx` (shadcn + `class-variance-authority`) — ne treba
nova komponenta, samo primjena varijanti i veći touch-friendly size za CTA.

**Primarno CTA** (hero, "Dodaj u korpu"):
```
bg-primary text-primary-foreground hover:bg-primary/90
font-sans font-medium tracking-[0.02em]
h-11 px-8 rounded-lg
```
Bez teške sjenke — premium brendovi (Frette, White Company) drže dugmad ravna, kontrast nosi boja, ne shadow.
Fokus: `focus-visible:ring-3 focus-visible:ring-ring/50` (već u bazi komponente).

**Sekundarno / outline** (npr. "Pogledaj detalje", filter dugmad):
```
border border-border bg-background text-foreground
hover:bg-muted hover:border-primary/40
h-10 px-6 rounded-lg
```

**Ghost / tekstualni link** (npr. "Svi proizvodi →"):
```
text-primary underline-offset-4 hover:underline font-medium
```

Nikad uppercase na dugoj rečenici; uppercase samo za kratke labele (`.text-eyebrow` klasa) ako je potrebno
poseban CTA tretman (npr. "NOVA KOLEKCIJA" eyebrow iznad hero naslova, ne na samom dugmetu).

### 4.2 Kartica proizvoda (`KarticaProizvoda`)

Sadržaj i redoslijed su već propisani u `CLAUDE_aurelia.md` §6 (cijena i materijal vidljivi bez klika —
istraživanje potvrđuje da lokalna konkurencija ovo ne radi). Ovdje je vizuelna implementacija:

```
<article class="group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-border
                 transition-shadow hover:shadow-md hover:ring-primary/30">

  <!-- slika 3:4, IKEA/White Company standard -->
  <div class="relative aspect-[3/4] overflow-hidden bg-muted">
    <img class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" ... />
    <!-- bedž "Novo" (opciono) -->
    <span class="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-eyebrow text-accent-foreground">
      Novo
    </span>
  </div>

  <div class="flex flex-col gap-1.5 p-4">
    <h3 class="font-heading text-base font-medium leading-snug text-foreground line-clamp-2
               group-hover:text-primary">
      <a href="/shop/[slug]/">{naziv}</a>
    </h3>

    <p class="text-sm text-muted-foreground">{materijal} · {dimenzija}</p>

    <div class="mt-1 flex items-baseline gap-2">
      <span class="font-sans text-lg font-semibold text-foreground">{cijena} KM</span>
      <!-- ako je sniženje: -->
      <span class="text-sm text-muted-foreground line-through">{cijenaStara} KM</span>
    </div>

    <button class="mt-2 h-10 w-full rounded-lg border border-border bg-background text-sm font-medium
                    text-foreground transition-colors hover:bg-primary hover:text-primary-foreground
                    hover:border-primary">
      Dodaj u korpu
    </button>
  </div>
</article>
```

Napomena o sniženju: ako se ikad koristi, nova cijena ostaje `text-foreground` (ne crvena/terakota) —
terakota (`--destructive`) je rezervisana za mali bedž ("-15%"), ne za samu cijenu, da kartica ostane mirna
(izbjeći Daphne/Sinsay obrazac gdje popust dominira).

### 4.3 Hero (početna)

Statična slika (bez slidera — blokirajuće pravilo iz `CLAUDE_aurelia.md` §4.02), tekst usidren dolje-lijevo
preko toplog gradient overlay-a radi kontrasta teksta na slici.

```
<section class="relative flex min-h-[70vh] items-end overflow-hidden rounded-b-2xl md:min-h-[80vh]">
  <img
    src="..." alt="..."
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover"
  />
  <div class="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent"></div>

  <div class="relative z-10 max-w-xl px-4 pb-12 sm:px-6 md:pb-20 lg:px-8">
    <p class="text-eyebrow mb-3 text-background/80">Nova kolekcija</p>
    <h1 class="font-heading text-4xl font-normal leading-[1.1] text-background md:text-6xl">
      Posteljina koja pretvara krevet u utočište
    </h1>
    <p class="mt-4 text-lg leading-relaxed text-background/90">
      100% pamučna posteljina za bračni i jednostruki krevet, s dostavom po cijeloj BiH.
    </p>
    <a href="/shop/" class="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-8
               font-medium text-primary-foreground hover:bg-primary/90">
      Pogledaj ponudu
    </a>
  </div>
</section>
```

Tekst na slici koristi `text-background`/`text-background/80` (svijetli ivory) jer overlay je taman —
**ne** koristiti `text-foreground` ovdje. Podnaslov mora prirodno sadržati keywords *posteljina*, *pamuk*,
*dostava BiH* (SEO pravilo iz CLAUDE_aurelia.md §4.02) — primjer gore to ispunjava.

### 4.4 Trust traka

4 ikonice u redu, mirna pozadina (`bg-muted`), tanke separator linije na desktopu — ne bedž, ne jarka boja.

```
<section class="border-y border-border bg-muted">
  <div class="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4
              md:divide-x md:divide-border lg:px-8">
    <div class="flex items-center gap-3 md:justify-center md:px-4">
      <TruckIcon class="size-5 shrink-0 text-primary" />
      <span class="text-sm font-medium text-foreground">Dostava po cijeloj BiH</span>
    </div>
    <!-- ponoviti za: Plaćanje pouzećem · Zamjena u 14 dana · 100% pamuk -->
  </div>
</section>
```

Ikonice iz `lucide-react` (već u `package.json`), boja `text-primary` (bronza), veličina `size-5`.
Tekst je pravi HTML (`<span>`), nikad slika — SEO/blokirajuće pravilo.

---

## 5. Sažetak odluka (za brzu referencu)

- **Paleta:** topli ivory (`#FAF6F0`) + topli charcoal tekst + prigušena bronza/zlato kao primary
  (`#8A6634`) + blijedi champagne akcent (`#EFE2C5`, suzdržano) + prigušena terakota za sniženje
  (`#B2593B`, nikad crvena). Sve vrijednosti su u `src/app/globals.css` kao OKLCH CSS custom properties.
- **Tipografija:** Fraunces (naslovi, weight 300-600, topao/mekan serif) + DM Sans (tekst, weight 400-700),
  oba preko `next/font/google`, subset `latin-ext` obavezan zbog bosanske dijakritike. Skala h1-h3 već
  primijenjena kao default u `@layer base`.
- **Radius:** `0.75rem` (podignut sa default shadcn `0.625rem`) za mekši, boutique osjećaj.
- **Komponente:** dugme bez teške sjenke (boja nosi kontrast), kartica proizvoda po IKEA/White Company
  standardu (cijena + materijal + dimenzija vidljivi bez klika), hero bez slidera sa gradient overlay-om,
  trust traka mirna/tekstualna bez bedž stila.
