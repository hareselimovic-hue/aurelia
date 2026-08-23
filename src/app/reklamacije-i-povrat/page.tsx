// REKLAMACIJE I POVRAT — CLAUDE_aurelia.md §2. Zamjena/povrat konzistentno sa FAQ na početnoj
// (src/app/page.tsx — 14 dana od prijema, nekorišten artikal u originalnom pakovanju, kontakt
// telefonom/Viberom). Reklamacije zbog oštećenja/greške u isporuci su razuman generički proces,
// ne izmišljen pravni tekst. Header/Footer su globalni.

import type { Metadata } from "next";
import { AlertTriangle, RotateCcw } from "lucide-react";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Reklamacije i povrat | Aurelia.ba",
  description:
    "Zamjena i povrat u roku od 14 dana od prijema, i postupak reklamacije u slučaju oštećenja ili greške u isporuci.",
  alternates: {
    canonical: `${SITE_URL}/reklamacije-i-povrat/`,
  },
};

const KORACI_ZAMJENE = [
  {
    broj: "01",
    naslov: "Javite nam se u roku od 14 dana",
    tekst:
      "Od dana kad preuzmete paket imate 14 dana da nam se javite telefonom ili preko Vibera ako veličina ili model ne odgovaraju.",
  },
  {
    broj: "02",
    naslov: "Artikal mora biti nekorišten",
    tekst:
      "Za zamjenu ili povrat, proizvod mora biti nekorišten, neopran i u originalnom pakovanju, bez tragova upotrebe.",
  },
  {
    broj: "03",
    naslov: "Dogovorimo zamjenu ili povrat",
    tekst:
      "Direktno s vama dogovaramo sljedeći korak — zamjenu za drugu dimenziju/proizvod ili povrat, bez formulara i čekanja na potvrdu.",
  },
] as const;

export default function ReklamacijeIPovratPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <h1>Reklamacije i povrat</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Trudimo se da svaki proizvod stigne tačno onakav kakav ste naručili. Ako ipak nešto ne
          odgovara — veličina, model, ili je paket stigao oštećen — javite nam se, rješavamo to
          direktno s vama.
        </p>
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <RotateCcw className="size-5" aria-hidden="true" />
          </div>
          <h2>Zamjena i povrat</h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {KORACI_ZAMJENE.map((korak) => (
            <div key={korak.broj} className="rounded-xl bg-card p-6 ring-1 ring-border">
              <span
                className="font-heading text-4xl font-light text-primary/40"
                aria-hidden="true"
              >
                {korak.broj}
              </span>
              <h3 className="mt-4">{korak.naslov}</h3>
              <p className="mt-2 text-muted-foreground">{korak.tekst}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <h2>Reklamacije zbog oštećenja ili greške u isporuci</h2>
        </div>
        <p className="mt-4 text-muted-foreground">
          Ako paket stigne oštećen ili primijetite grešku u isporuci (npr. pogrešan artikal,
          pogrešna dimenzija ili nedostajuća stavka), javite nam se što prije nakon prijema —
          telefonom, preko Vibera ili emailom, uz fotografiju problema.
        </p>
        <p className="mt-4 text-muted-foreground">
          Na osnovu fotografije i opisa dogovaramo najbrže rješenje: zamjenu za ispravan artikal
          ili povrat novca, zavisno od toga šta vam više odgovara.
        </p>
      </div>
    </div>
  );
}
