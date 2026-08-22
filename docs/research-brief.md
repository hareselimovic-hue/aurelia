# Research Brief — konkurencija za Aurelia webshop (posteljina, BiH)

Datum: 22.08.2026
Metod: web istraživanje (WebFetch/WebSearch) postojećih sajtova iz `CLAUDE_aurelia.md` §13, plus 3 premium bedding brenda van regije za vizuelnu inspiraciju. Napomena: nekoliko regionalnih sajtova (JYSK, dijelom Sinsay) renderuje sadržaj kroz JS pa je fetch vratio uglavnom navigacijsku strukturu — ti nalazi su dopunjeni poznatim industrijskim standardom tog brenda i jasno su označeni kao djelomični.

---

## 1. Tabelarni pregled po sajtu

| Sajt | Vizuelno | Sadržajno / UX |
|---|---|---|
| **jysk.ba** | Skandinavski minimalizam, JS-rendered SPA (fetch nije otkrio pune detalje). Poznato iz JYSK standarda: tri nivoa kvaliteta **BASIC/PLUS/GOLD** kao badge na kartici, dosljedan grid, plava/žuta brend akcenta samo u headeru/CTA, proizvod fotografisan studijski na bijeloj pozadini. | Jasna hijerarhija kategorija (Spavaća soba › Posteljine › Glatke/Satenske/Dječije), postoji edukativni vodič "Kako izabrati posteljinu" — dobar SEO/trust potez. Filteri po materijalu, dimenziji, kvalitetnom nivou. |
| **daphne.ba** | Lifestyle fotografija (spavaće sobe in situ, ne samo studio), topli neutralni ton (bijela/krem/siva + bež/terrakota akcenti), agresivni popust-bedževi (crveno/narandžasto, "40% OFF"). Fizička lokacija (Mepas Mall) gradi povjerenje. | Kartica pokazuje cijenu (staru+novu), naziv, % popusta — sve bez klika. Kategorije: Kućni tekstil › Posteljina/Deka/Prekrivač, plus Hotelski tekstil segment. FAQ postoji, dostava besplatna preko praga (195 KM), povrat 14 dana. Ovo je najbliži direktni konkurent brendu Aurelia po pozicioniranju (dostupan luksuz). |
| **posteljine-in.ba** | Bijela pozadina, crn tekst, minimalistički, bez izražene tipografske ličnosti. Fokus na "100% pamuk" kao jedinu jaku poruku. | Kartica pokazuje samo naziv + raspon cijene (27–44 KM) + "Odaberi opcije" — **materijal i dimenzije nisu vidljivi bez klika**, ovo je slabost koju Aurelia treba izbjeći. Trust: Viber/WhatsApp podrška, "sigurna kupovina" bedž. Nema vidljivog FAQ-a. |
| **posteljina.hr** | Odoo-based, generički e-commerce template, bijelo/sivo, bez promo hero slike na početnoj — čisto tekstualna navigacija. Osjećaj: budžetski, bezličan. | Cijena/materijal/dimenzije zahtijevaju klik na svaki proizvod — loš UX obrazac. Kategorije po prostoriji (spavaća soba, kupaonica). Nema vidljivog FAQ-a niti trust trake. |
| **posteljine.ba** | Emotivan, sezonski storytelling hero ("Winter Moments with Nezira"), tople boje (krem lan, pastel), fotografija lifestyle. Osjećaj: topao, personaliziran, malo neuredan (puno kategorija/potkategorija odjednom). | Cijena vidljiva na kartici (dobro), ali materijal/dimenzije ne. Jak trust blok: "12+ godina, 280+ proizvoda, 4 poslovnice, 10.000+ kupaca" + imenovane recenzije po gradu — ovo je efikasan, konkretan trust obrazac vrijedan kopiranja u principu (ne doslovno). |
| **aksabih.ba** | Pastelna paleta (roze/plavo/sivo), fokusirano na bebe/djecu, ne na bračnu/odraslu posteljinu — niska direktna relevantnost za Aurelia katalog, ali vrijedna referenca za buduću "dječija posteljina" fazu 2 kategoriju. | Kartica ima sliku, naziv, cijenu, dugmad "Kupi"/"Detaljnije", wishlist srce. Trust: sigurno plaćanje, brendovi kartica prikazani, 24h dostava. |
| **ananas.ba** | Marketplace estetika (Next.js), agresivni % popusti u crvenom, badge sistem ("brzo", "Ananas As", besplatna dostava). Nema posvećene kategorije za posteljinu/tekstil za dom — signal da ni najveći BiH marketplace ne tretira ovu nišu posebno. | Standardni marketplace trust: FAQ, radno vrijeme podrške, eTrustmark. Manje relevantno za direktnu vizuelnu inspiraciju (previše "marketplace", ne "brend"). |
| **textil.ba** | Dvoslajdni hero, bijela/siva baza s narandžasto-crvenim "Sniženje" akcentima, visokokvalitetne fotografije na bijeloj pozadini. Osjećaj: srednja klasa, pristupačno-funkcionalno. | Kartica: slika, kategorija, naziv, precrtana stara cijena + nova, "Izaberi opciju". Trust: povrat novca, besplatna dostava od 150 KM, kupovina na rate do 6 mjeseci — rate su lokalno relevantan trust signal koji Aurelia treba razmotriti. Kategorije po prostoriji. |
| **ikea.com (posteljina kategorija)** | Vrlo čist minimalizam, bijela pozadina, fotografija u dvije varijante (proizvod samostalno + "u sobi"). Video demo za praktične funkcije (npr. navlaka s rupicama). | **Najkompletnija kartica u istraživanju**: naziv, cijena, dimenzije, materijal, zvjezdice+broj recenzija — sve bez klika. Filter/sortiraj sekcija eksplicitna (materijal, dimenzija, boja, cijena). Ovo je referentni standard za "šta mora biti vidljivo na kartici". |
| **sinsay.com** | Fast-fashion energija: žive boje (narandžasta/plava/crvena) za promo bedževe, agresivne popust-poruke ("-20%"). Osjećaj: jeftino/trendovski, suprotno od pozicioniranja koje Aurelia želi. | Nije dostupan pun uvid u karticu (JS-rendered), ali kategorija posteljine postoji unutar "Kuća › Dnevna soba" — plitka integracija bedding-a u širi fashion katalog, ne posvećen tretman. |
| **Frette** (premium, van regije) | Fullscreen lifestyle fotografija, ogromni negativni prostor, fina/tanka tipografija, paleta strogo neutralna (bijela/siva/crna) s po jednom suptilnom sezonskom akcentnom bojom (npr. verdigris, moonstone bež). Cijene vrlo visoke (i do $3.000) prikazane bez stida — cijena kao signal kvaliteta. | Trust kroz historiju ("since 1860"), bespoke usluge (monogramiranje), boutique lokatori. Minimalan tekst na kartici — luksuz se prodaje kroz atmosferu, ne kroz specifikacije. |
| **The White Company** (premium, van regije) | Dominantno bijelo/off-white s vrlo suptilnim akcentima (blush, mink, silver, navy) — "svijetla, mekana" paleta koja je najbliža onome što Aurelia treba. Fotografija čista, studio + in-situ kombinacija. Sans-serif, jasna hijerarhija. | Kartica pokazuje sve: naziv kolekcije, tačan sastav materijala ("100% Egyptian Cotton, Percale"), raspon cijena, boje kao swatch kvadratići, broj recenzija ("Most Loved"). Ovo je najbolji referentni model kartice za Aurelia — potpun, ali ne pretrpan. |
| **Brooklinen** (premium/pristupačno, van regije) | Ograničen uvid (fetch vratio generički opis), ali poznato iz brenda: čist minimalizam, off-white pozadina, plavo-zeleni brend akcent, fotografija realnih spavaćih soba (ne sterilni studio). | Pozicioniranje "pristupačan luksuz" — direktno relevantno kao model za Aurelia jer cilja isti jaz između IKEA-budžeta i Frette-luksuza. |

---

## 2. Zajednički obrasci (industry standard — mora se ispoštovati)

1. **Cijena je uvijek vidljiva na kartici bez klika** — apsolutno svi sajtovi (i budžetski i luksuzni) ovo rade. Kod luksuznih brendova cijena je čak istaknuta kao status-signal.
2. **Bijela/neutralna pozadina kao baza** — nijedan konkurent, ni budžetski ni luksuzni, ne koristi tamnu ili jarko obojenu pozadinu za shop/grid. Boja se koristi kao akcent (CTA, bedž), nikad kao dominantna površina.
3. **Grid layout za proizvode**, 3-4 kolone desktop, konzistentna kartica širom sajta (naslov, slika, cijena, CTA).
4. **Trust traka/blok blizu vrha ili uz proizvod** — dostava, povrat, plaćanje. BiH-specifični sajtovi dodatno ističu Viber/WhatsApp podršku i "sigurna kupovina" bedž (lokalni nedostatak povjerenja u online plaćanje).
5. **Kategorije po prostoriji ili tipu proizvoda** u navigaciji — svi strukturišu meni oko toga (spavaća soba, kupatilo…), čak i kad je katalog malen.
6. **Popust-bedževi u toploj/crvenoj boji** kod budžetskih i srednjih brendova (JYSK, Daphne, textil.ba, Sinsay, ananas.ba) — univerzalni vizuelni jezik za sniženje koji korisnici u BiH prepoznaju.
7. **Fotografija je dvostruka**: proizvod samostalno (studio, bijela pozadina) + proizvod "u sobi" (lifestyle) — IKEA i premium brendovi ovo rade sistematski; lokalni budžetski sajtovi rjeđe.

## 3. Praznine / prilike — gdje niko ne radi dobro

1. **Materijal i dimenzije skoro niko ne prikazuje na kartici bez klika** (posteljine-in.ba, posteljina.hr, posteljine.ba, textil.ba svi ovo izostavljaju). Jedino IKEA i The White Company to rade dobro. Aurelia ovdje ima jasnu priliku — CLAUDE_aurelia.md §6 već propisuje "100% pamuk · 200x200" na kartici, što je ispred lokalne konkurencije.
2. **Niko lokalno ne kombinuje toplu/svijetlu paletu s ozbiljnom tipografijom.** Lokalni sajtovi su ili sterilno bijelo-sivi (posteljina.hr, posteljine-in.ba) ili prenatrpani jarkim popust-bojama (Sinsay, textil.ba, ananas.ba). Niko ne pogađa "mekano, toplo, elegantno" — to je prazan prostor tačno gdje Aurelia cilja.
3. **Opisi proizvoda su generički / kopirani od dobavljača** kod svih lokalnih igrača (potvrđeno u CLAUDE_aurelia.md §7 kao poznat rizik) — nijedan sajt u istraživanju nije imao vidljivo originalan, ubjedljiv opis. Prilika za diferencijaciju kroz tekst, ne samo dizajn.
4. **FAQ i edukativni sadržaj su rijetki i plitki lokalno** (samo JYSK ima pravi vodič "kako izabrati posteljinu"; Daphne ima FAQ; ostali ništa ili blog bez strukture). Aurelia već ima FAQ blok propisan u §4.08 — treba ga popuniti stvarno korisnim sadržajem (dimenzije za bračni krevet, skupljanje nakon pranja itd.) jer to lokalno skoro niko ne radi.
5. **Trust kroz konkretne brojke** (posteljine.ba: "12+ godina, 280+ proizvoda, 10.000+ kupaca") djeluje jače od generičkih ikonica. Aurelia trenutno nema tu istoriju/brojke (nov brend, 8 od 15 proizvoda), pa treba naći iskren ekvivalent (npr. "ručno biran materijal", "šivano u BiH" ako je tačno) — ne izmišljati brojke niti lažne recenzije (već zabranjeno u §4.09).
6. **Nema lokalnog konkurenta koji cijene u nižem segmentu (peškiri 3-19 KM, čaršafi 13-19 KM) prezentuje elegantno.** Svi budžetski sajtovi s niskim cijenama izgledaju jeftino (posteljine-in.ba, textil.ba). Aurelia realni katalog (3-55 KM raspon) je upravo u tom segmentu — prilika je dizajnirati tako da niska cijena ne signalizira nisku kvalitetu (mekana paleta + čista tipografija + dobra fotografija rade ovo, po uzoru na The White Company, čak i kad je proizvod jeftin).

## 4. Konkretne preporuke za `aurelia-designer`

**Paleta:**
Ići pravcem **The White Company / Brooklinen**, ne Frette (previše hladno-strogo) ni lokalnih budžetskih sajtova (previše jarko/popust-crveno kao dominanta). Konkretno:
- Baza: bijela / off-white / vrlo svijetli krem (ne čisto `#FFFFFF` sterilno, nego topli off-white nijansa)
- Sekundarna neutralna: mekana siva ili "mink"/bež ton za tekst/pozadinske blokove
- Akcent koji nosi asocijaciju na "Aurelia = zlatno" ali ostaje svijetao: **vrlo blijed champagne/šampanjac ili "warm sand"** ton — koristi se suzdržano (linije, ikonice, hover stanja), nikad kao velika površina, nikad sjajni/metalik zlatni gradient (to bi skliznulo u kič, suprotno pozicioniranju).
- Popust/sniženje boja (ako ikad zatreba): topla terrakota/rusty, ne agresivno crvena — usklađeno s toplom paletom, ne kontrastno kao kod lokalnih budžetskih igrača.
- Izbjegavati: jarku plavu/narandžastu/crvenu kao brend boju (Sinsay, ananas.ba, textil.ba teritorija), i hladnu korporativnu plavu (JYSK teritorija).

**Tipografski ton:**
- Elegantna, čitljiva sans-serif za UI/tekst tijela (kao The White Company) — ne dekorativna.
- Za `<h1>`/naslove razmotriti suptilan serif ili sans sa širim razmakom slova radi "premium" osjećaja bez skupog utiska — Daphne i Frette obje koriste tanku, mirnu tipografiju za taj efekat.
- Nikad bold/glomazna fast-fashion tipografija (Sinsay stil).

**Layout obrasci koje slijediti:**
- Kartica proizvoda po IKEA/White Company standardu: cijena + materijal + dimenzija vidljivi bez klika (ovo je već propisano u CLAUDE_aurelia.md §6 — istraživanje potvrđuje da je ovo iznad lokalnog standarda i treba se strogo poštovati).
- Dupla fotografija gdje je moguće: proizvod samostalno (čista pozadina) + lifestyle/in-situ, po uzoru na IKEA i premium brendove — važno jer trenutni katalog nema prave fotografije (placeholder faza), pa ovo je smjernica za `aurelia-frontend` kad prave slike stignu.
- Trust traka s konkretnim, provjerljivim porukama (dostava, plaćanje, zamjena) — bez izmišljenih brojki dok Aurelia nema historiju.
- FAQ i "kako odabrati" edukativni tekst kao stvarna diferencijacija — ovdje lokalna konkurencija najslabije stoji.

**Layout obrasci koje izbjeći:**
- Slider u hero-u (već zabranjeno u §4.02, i istraživanje potvrđuje da premium brendovi koriste statičnu punu sliku, ne slider).
- Prenatrpan meni s previše potkategorija odjednom (problem uočen kod posteljine.ba) — sa 8-15 proizvoda Aurelia treba ostati kod plosnate, jednostavne strukture iz §2.
- Kartica bez vidljive cijene/materijala (greška kod posteljine-in.ba, posteljina.hr) — direktno kršenje već postavljenog pravila u §6, istraživanje samo potvrđuje zašto je pravilo dobro.
- Agresivni popust-bedževi kao primarni vizuelni element — ako se koriste sniženja, treba ih tretirati suptilno, u skladu sa toplom/mekom paletom, ne kao kod Daphne/Sinsay gdje popust dominira karticom.

---

*Napomena: Ovaj brief je osnova za `aurelia-designer`. Ne sadrži finalne dizajn odluke (tačne hex vrijednosti, font parove, komponente) — to je sljedeći korak tog agenta.*
