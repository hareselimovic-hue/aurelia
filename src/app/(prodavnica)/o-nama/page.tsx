// O NAMA — CLAUDE_aurelia.md §2 (ruta postoji u arhitekturi, footer/header već linkuju na nju).
// Sadržaj je stvaran narativ korisnika (23.08.2026), ne izmišljena priča: Aurelia je nov brend
// (bez izmišljenih godina/brojki kupaca, konzistentno sa "Ko stoji iza shopa" blokom na početnoj),
// osnivač dolazi iz svijeta kratkoročnog najma/upravljanja apartmanima (isti svijet kao
// testimonijal "Sarajevo Rent & Manage" na početnoj), a tri stuba (kvalitet, udobnost,
// izdržljivost) su proizašla iz te prakse. Header/Footer su globalni (layout.tsx), ne ponavljaju
// se ovdje.

import type { Metadata } from "next";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "O nama | Aurelia.ba",
  description:
    "Aurelia je nov brend posteljine izgrađen oko tri stvari: kvaliteta, udobnosti i izdržljivosti. Pročitajte otkud ideja i šta nam je najbitnije.",
  alternates: {
    canonical: `${SITE_URL}/o-nama/`,
  },
};

export default function ONamaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-eyebrow text-primary">O brendu</p>
        <h1 className="mt-3">O nama</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Aurelia je mlad brend posteljine — nemamo dugu historiju ni priču staru decenijama, i
          nećemo se pretvarati da imamo. Ono što imamo je jasna ideja od koje smo krenuli:
          posteljina prije svega mora biti kvalitetna, udobna i izdržljiva. Sve ostalo — boje,
          dizajn, asortiman — gradimo oko te tri stvari, ne obrnuto.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
        <div className="max-w-3xl space-y-4">
          <h2>Otkud ideja</h2>
          <p className="text-muted-foreground">
            Aurelia nije nastala za stolom, nego iz svakodnevnog posla. Dolazimo iz svijeta
            iznajmljivanja i upravljanja apartmanima za kratkoročni najam — posla u kojem se
            posteljina mijenja i pere mnogo češće nego u prosječnom domaćinstvu, i u kojem se
            svaka mahana na tkanini vrlo brzo primijeti, bilo kod gosta, bilo kod nas.
          </p>
          <p className="text-muted-foreground">
            Kroz tu praksu se pokazalo da baš tri stvari prave najveću razliku: kvalitet,
            udobnost i izdržljivost — posteljina koja podnese učestala pranja i stalnu smjenu
            gostiju, a da pritom ne izgubi izgled ni udobnost. To se teško primijeti dok se
            posteljina bira samo za sebe, za jedan krevet kod kuće — ali kad ista tkanina prođe
            kroz deseta pranja u tri mjeseca, razlika između dobre i osrednje posteljine postane
            sasvim očigledna.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- lokalna slika, bez next/image domain configa */}
          <img
            src="/images/products/bracna-1-hotel.webp"
            alt="Pamučna posteljina od damasta na bračnom krevetu"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-16 max-w-3xl space-y-4">
        <h2>Šta nam je najbitnije</h2>
        <p className="text-muted-foreground">
          Iz tog iskustva je proizašla želja da se tržištu ponudi jednostavno, pouzdano rješenje:
          posteljina birana upravo po ta tri kriterija, podjednako dostupna za dom i za
          profesionalnu upotrebu. Ne biramo materijal po tome šta je najjeftinije nabaviti, nego
          po tome šta stvarno izdrži — i to je, čini nam se, jedina razlika koja se na kraju i
          osjeti, dok ostalo često ostaje samo lijepa fotografija.
        </p>
        <p className="text-muted-foreground">
          Kvalitet, udobnost i izdržljivost nisu za nas marketinške riječi — to su tri stvari koje
          smo naučili prepoznati kroz stotine pranja i smjena gostiju, prije nego što smo ih
          ikada napisali na sajtu.
        </p>
      </div>

      <div className="mt-16 max-w-3xl space-y-4">
        <h2>Aurelia danas</h2>
        <p className="text-muted-foreground">
          Danas je Aurelia mali, pažljivo biran asortiman: pamučni damast, čaršafi i peškiri.
          Ne širimo ponudu radi širenja — svaki novi artikal prolazi kroz isti kriterij kao i
          prvi. Radimo bez posrednika i bez call centra: pitanja o proizvodu ili narudžbi
          rješavamo direktno s vama, telefonom ili preko Vibera.
        </p>
      </div>
    </div>
  );
}
