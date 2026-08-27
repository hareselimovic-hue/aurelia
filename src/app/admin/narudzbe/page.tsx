import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

import { oznaciPoslano } from "./actions";
import { OdjaviSeDugme } from "./odjavi-se-dugme";

export const dynamic = "force-dynamic";

const NAZIVI_NACINA_PLACANJA: Record<string, string> = {
  pouzece: "Pouzeće",
  "bankovni-transfer": "Bankovni transfer",
  kartica: "Kartica",
};

const STATUS_FILTERI = [
  { vrijednost: "sve", naziv: "Sve" },
  { vrijednost: "nova", naziv: "Nova" },
  { vrijednost: "poslano", naziv: "Poslano" },
] as const;

const NACIN_FILTERI = [
  { vrijednost: "sve", naziv: "Sve" },
  { vrijednost: "pouzece", naziv: "Pouzeće" },
  { vrijednost: "bankovni-transfer", naziv: "Bankovni transfer" },
  { vrijednost: "kartica", naziv: "Kartica" },
] as const;

function formatirajDatum(datum: Date): string {
  return new Intl.DateTimeFormat("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(datum);
}

type AdminNarudzbePageProps = {
  searchParams: Promise<{ status?: string; placanje?: string; q?: string }>;
};

export default async function AdminNarudzbePage({ searchParams }: AdminNarudzbePageProps) {
  const params = await searchParams;
  const status = params.status === "nova" || params.status === "poslano" ? params.status : "sve";
  const placanje = NACIN_FILTERI.some((f) => f.vrijednost === params.placanje)
    ? (params.placanje as string)
    : "sve";
  const upit = params.q?.trim() ?? "";

  const sveNarudzbe = await prisma.narudzba.findMany({
    orderBy: { createdAt: "desc" },
  });

  const brojNovih = sveNarudzbe.filter((n) => n.status === "nova").length;

  // Filtriranje u aplikaciji (ne u bazi) — obim narudžbi za jednu malu prodavnicu je dovoljno mali
  // da nema potrebe za odvojenim upitom u bazu po filteru; "sve" i brojevi gore uvijek računaju iz
  // punog seta, bez obzira na aktivni filter.
  const narudzbe = sveNarudzbe.filter((n) => {
    if (status !== "sve" && n.status !== status) return false;
    if (placanje !== "sve" && n.nacinPlacanja !== placanje) return false;
    if (!upit) return true;
    const upitMali = upit.toLowerCase();
    return (
      n.brojNarudzbe.toLowerCase().includes(upitMali) ||
      n.imePrezime.toLowerCase().includes(upitMali) ||
      n.email.toLowerCase().includes(upitMali)
    );
  });

  // Gradi href za pill filtere — čuva ostale aktivne filtere, mijenja samo onaj čiji je "kljuc"
  // proslijeđen (npr. klik na status pill zadržava aktivan način plaćanja i pretragu).
  function hrefZaFilter(kljuc: "status" | "placanje", vrijednost: string) {
    const sp = new URLSearchParams();
    const noviStatus = kljuc === "status" ? vrijednost : status;
    const novoPlacanje = kljuc === "placanje" ? vrijednost : placanje;
    if (noviStatus !== "sve") sp.set("status", noviStatus);
    if (novoPlacanje !== "sve") sp.set("placanje", novoPlacanje);
    if (upit) sp.set("q", upit);
    const query = sp.toString();
    return `/admin/narudzbe/${query ? `?${query}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">Narudžbe</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {sveNarudzbe.length} ukupno · {brojNovih} {brojNovih === 1 ? "nova" : "novih"}
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        {/* Filteri — status i način plaćanja kao pill dugmad (linkovi, rade bez JS-a) + pretraga po
            broju/kupcu/emailu preko GET forme, isti obrazac kao shop filteri
            (src/app/(prodavnica)/shop/page.tsx). */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Status:</span>
                {STATUS_FILTERI.map((f) => (
                  <Link
                    key={f.vrijednost}
                    href={hrefZaFilter("status", f.vrijednost)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                      status === f.vrijednost
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted active:border-primary/40 active:bg-muted"
                    )}
                  >
                    {f.naziv}
                    {f.vrijednost === "nova" && brojNovih > 0 && (
                      <span className="ml-1.5 opacity-70">({brojNovih})</span>
                    )}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Plaćanje:</span>
                {NACIN_FILTERI.map((f) => (
                  <Link
                    key={f.vrijednost}
                    href={hrefZaFilter("placanje", f.vrijednost)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                      placanje === f.vrijednost
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted active:border-primary/40 active:bg-muted"
                    )}
                  >
                    {f.naziv}
                  </Link>
                ))}
              </div>
            </div>

            <form method="get" className="flex gap-2">
              {status !== "sve" && <input type="hidden" name="status" value={status} />}
              {placanje !== "sve" && <input type="hidden" name="placanje" value={placanje} />}
              <Input
                type="search"
                name="q"
                defaultValue={upit}
                placeholder="Broj, kupac ili email…"
                aria-label="Pretraga narudžbi"
                className="h-9 w-full sm:w-64"
              />
            </form>
          </div>
        </div>

        {sveNarudzbe.length === 0 ? (
          <div className="mt-10 rounded-xl bg-card p-10 text-center ring-1 ring-border">
            <p className="text-muted-foreground">Još nema narudžbi.</p>
          </div>
        ) : narudzbe.length === 0 ? (
          <div className="mt-6 rounded-xl bg-card p-10 text-center ring-1 ring-border">
            <p className="text-muted-foreground">Nema narudžbi koje odgovaraju filteru.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl bg-card ring-1 ring-border">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Broj</th>
                  <th className="px-4 py-3 font-medium">Kupac</th>
                  <th className="px-4 py-3 font-medium">Plaćanje</th>
                  <th className="px-4 py-3 text-right font-medium">Iznos</th>
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {narudzbe.map((n) => (
                  <tr key={n.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{n.brojNarudzbe}</td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{n.imePrezime}</div>
                      <div className="text-xs text-muted-foreground">
                        {n.email} · {n.telefon}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {n.adresa}, {n.postanskiBroj} {n.grad}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {NAZIVI_NACINA_PLACANJA[n.nacinPlacanja] ?? n.nacinPlacanja}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatPrice(Number(n.ukupnaCijena))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatirajDatum(n.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {n.status === "poslano" ? (
                        <Badge variant="secondary">Poslano</Badge>
                      ) : (
                        <Badge>Nova</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {n.status !== "poslano" && (
                        <form action={oznaciPoslano}>
                          <input type="hidden" name="id" value={n.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Označi poslano
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
