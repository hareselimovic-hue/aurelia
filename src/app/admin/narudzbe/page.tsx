import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function formatirajDatum(datum: Date): string {
  return new Intl.DateTimeFormat("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(datum);
}

export default async function AdminNarudzbePage() {
  const narudzbe = await prisma.narudzba.findMany({
    orderBy: { createdAt: "desc" },
  });

  const brojNovih = narudzbe.filter((n) => n.status === "nova").length;

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">Narudžbe</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {narudzbe.length} ukupno · {brojNovih} {brojNovih === 1 ? "nova" : "novih"}
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        {narudzbe.length === 0 ? (
          <div className="mt-10 rounded-xl bg-card p-10 text-center ring-1 ring-border">
            <p className="text-muted-foreground">Još nema narudžbi.</p>
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
                        {n.adresa}, {n.grad}
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
