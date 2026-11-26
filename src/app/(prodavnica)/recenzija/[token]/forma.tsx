"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProizvodZaOcjenu = { slug: string; naziv: string; slika: string | null };

function Zvjezdice({
  vrijednost,
  onChange,
  oznaka,
}: {
  vrijednost: number;
  onChange: (v: number) => void;
  oznaka: string;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={oznaka}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={vrijednost === n}
          aria-label={`${n} od 5`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Star
            className={cn(
              "size-8 transition-colors",
              n <= vrijednost ? "fill-[#C9A15B] text-[#C9A15B]" : "text-border",
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function PreporukaKutija({
  link,
  procenat,
  maksPrijatelja,
}: {
  link: string;
  procenat: number;
  maksPrijatelja: number;
}) {
  const [kopirano, setKopirano] = useState(false);
  const poruka = `Poklanjam ti ${procenat}% popusta na Aurelia posteljinu i peškire od 100% pamuka: ${link}`;

  async function kopiraj() {
    try {
      await navigator.clipboard.writeText(link);
      setKopirano(true);
      setTimeout(() => setKopirano(false), 2000);
    } catch {
      // clipboard nedostupan — link je vidljiv i može se označiti ručno
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-normal text-foreground">
        Poklonite prijatelju {procenat}%
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Pošaljite svoj lični link. Prijatelj dobija {procenat}% na prvu narudžbu, a vi za svakog ko
        naruči dobijate svoj kod za {procenat}% na mail — do {maksPrijatelja} prijatelja.
      </p>
      <div className="mt-4 flex gap-2">
        <Input readOnly value={link} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
        <Button type="button" variant="outline" onClick={kopiraj} className="shrink-0">
          {kopirano ? "Kopirano" : "Kopiraj"}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`viber://forward?text=${encodeURIComponent(poruka)}`}
          className="rounded-lg bg-[#7360F2] px-4 py-2 text-sm font-medium text-white"
        >
          Pošalji na Viber
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(poruka)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white"
        >
          Pošalji na WhatsApp
        </a>
      </div>
    </div>
  );
}

export function RecenzijaForma({
  token,
  proizvodi,
  predlozenoIme,
  vecPoslano,
  linkPreporuke,
  procenat,
  maksPrijatelja,
}: {
  token: string;
  proizvodi: ProizvodZaOcjenu[];
  predlozenoIme: string;
  vecPoslano: boolean;
  linkPreporuke: string;
  procenat: number;
  maksPrijatelja: number;
}) {
  const [ocjene, setOcjene] = useState<Record<string, number>>({});
  const [komentari, setKomentari] = useState<Record<string, string>>({});
  const [ime, setIme] = useState(predlozenoIme);
  const [saljem, setSaljem] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [gotovo, setGotovo] = useState(vecPoslano);

  async function posalji(e: FormEvent) {
    e.preventDefault();
    if (proizvodi.some((p) => !ocjene[p.slug])) {
      setGreska("Označite zvjezdice za svaki proizvod.");
      return;
    }
    if (!ime.trim()) {
      setGreska("Upišite ime koje će se prikazati uz recenziju.");
      return;
    }
    setGreska(null);
    setSaljem(true);
    try {
      const odgovor = await fetch("/api/recenzija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ime: ime.trim(),
          ocjene: proizvodi.map((p) => ({
            slug: p.slug,
            ocjena: ocjene[p.slug],
            komentar: komentari[p.slug]?.trim() || undefined,
          })),
        }),
      });
      const rezultat = (await odgovor.json()) as { ok: boolean; greska?: string };
      if (!rezultat.ok) {
        setGreska(rezultat.greska ?? "Slanje nije uspjelo. Pokušajte ponovo.");
        return;
      }
      setGotovo(true);
    } catch {
      setGreska("Slanje nije uspjelo. Pokušajte ponovo.");
    } finally {
      setSaljem(false);
    }
  }

  const preporuka = (
    <PreporukaKutija link={linkPreporuke} procenat={procenat} maksPrijatelja={maksPrijatelja} />
  );

  if (gotovo) {
    return (
      <>
        <div className="mt-8 rounded-2xl bg-secondary p-6 text-center">
          <p className="font-heading text-2xl text-secondary-foreground">Hvala vam!</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Recenzija je primljena i pojaviće se na sajtu nakon pregleda.
          </p>
        </div>
        {preporuka}
      </>
    );
  }

  return (
    <>
      <form onSubmit={posalji} className="mt-8 space-y-6">
        {proizvodi.map((p) => (
          <div key={p.slug} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              {p.slika && (
                // eslint-disable-next-line @next/next/no-img-element -- mala lokalna sličica
                <img src={p.slika} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
              )}
              <p className="font-medium text-foreground">{p.naziv}</p>
            </div>
            <div className="mt-4">
              <Zvjezdice
                oznaka={`Ocjena za ${p.naziv}`}
                vrijednost={ocjene[p.slug] ?? 0}
                onChange={(v) => setOcjene((o) => ({ ...o, [p.slug]: v }))}
              />
            </div>
            <Textarea
              className="mt-4"
              rows={3}
              maxLength={1000}
              placeholder="Komentar (nije obavezno) — kvalitet, osjećaj, pranje…"
              value={komentari[p.slug] ?? ""}
              onChange={(e) => setKomentari((k) => ({ ...k, [p.slug]: e.target.value }))}
            />
          </div>
        ))}

        <div>
          <Label htmlFor="ime">Ime uz recenziju</Label>
          <Input
            id="ime"
            className="mt-2"
            maxLength={60}
            value={ime}
            onChange={(e) => setIme(e.target.value)}
          />
        </div>

        {greska && <p className="text-sm text-destructive">{greska}</p>}

        <Button type="submit" variant="cta" disabled={saljem} className="h-11 w-full sm:w-auto sm:px-8">
          {saljem ? "Šaljem…" : "Pošalji recenziju"}
        </Button>
      </form>

      <p className="mt-10 text-sm text-muted-foreground">Ne želite ostaviti recenziju? Link za prijatelje važi i bez nje:</p>
      {preporuka}
    </>
  );
}
