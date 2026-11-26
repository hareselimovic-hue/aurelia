// Recenzije na stranici proizvoda (korisnik, 26.11.2026) — samo ODOBRENE recenzije stvarnih kupaca
// (link iz maila nakon isporuke, /admin/recenzije/ odobrava). Bez recenzija → isti prazan tekst kao prije.

import { Star } from "lucide-react";

import { prisma } from "@/lib/prisma";

export type RecenzijaZaPrikaz = {
  id: string;
  ocjena: number;
  komentar: string | null;
  ime: string;
  createdAt: Date;
};

/** Odobrene recenzije za proizvod; prazna lista ako baza nije dostupna (npr. u build-u). */
export async function ucitajRecenzije(slug: string): Promise<RecenzijaZaPrikaz[]> {
  try {
    return await prisma.recenzija.findMany({
      where: { slug, status: "odobreno" },
      orderBy: { createdAt: "desc" },
      select: { id: true, ocjena: true, komentar: true, ime: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

export function prosjekOcjena(recenzije: RecenzijaZaPrikaz[]): number {
  if (recenzije.length === 0) return 0;
  return Math.round((recenzije.reduce((z, r) => z + r.ocjena, 0) / recenzije.length) * 10) / 10;
}

function Zvjezdice({ ocjena, velicina = "size-4" }: { ocjena: number; velicina?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${ocjena} od 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${velicina} ${n <= Math.round(ocjena) ? "fill-[#C9A15B] text-[#C9A15B]" : "text-border"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function Recenzije({ recenzije }: { recenzije: RecenzijaZaPrikaz[] }) {
  if (recenzije.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">Uskoro prve recenzije.</p>;
  }

  const prosjek = prosjekOcjena(recenzije);
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <Zvjezdice ocjena={prosjek} velicina="size-5" />
        <span className="text-sm text-foreground">
          <strong className="font-semibold">{prosjek.toLocaleString("bs-BA")}</strong> od 5 ·{" "}
          {recenzije.length} {recenzije.length === 1 ? "recenzija" : recenzije.length < 5 ? "recenzije" : "recenzija"}
        </span>
      </div>
      <ul className="mt-6 divide-y divide-border">
        {recenzije.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Zvjezdice ocjena={r.ocjena} />
              <span className="text-sm font-medium text-foreground">{r.ime}</span>
              <span className="text-xs text-[#2F6E45]">✓ Provjerena kupovina</span>
              <span className="text-xs text-muted-foreground">
                {r.createdAt.toLocaleDateString("bs-BA", { timeZone: "Europe/Sarajevo" })}
              </span>
            </div>
            {r.komentar && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.komentar}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
