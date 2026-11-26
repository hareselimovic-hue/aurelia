// /admin/recenzije/ (korisnik, 26.11.2026) — odobravanje recenzija kupaca + pregled programa preporuka.

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/products";

import { AdminNav } from "../admin-nav";
import { OdjaviSeDugme } from "../narudzbe/odjavi-se-dugme";
import { postaviStatusRecenzije } from "./actions";

export const dynamic = "force-dynamic";

function datum(d: Date): string {
  return d.toLocaleString("bs-BA", { timeZone: "Europe/Sarajevo", dateStyle: "short", timeStyle: "short" });
}

function zvjezdice(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

const NAZIV_STATUSA: Record<string, string> = { ceka: "Čeka", odobreno: "Objavljeno", odbijeno: "Skriveno" };

export default async function AdminRecenzijePage() {
  const [recenzije, koristenja, preporuke, mailovaPoslano] = await Promise.all([
    prisma.recenzija.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.preporukaKoristenje.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.preporuka.findMany(),
    prisma.narudzba.count({ where: { recenzijaMailAt: { not: null } } }),
  ]);
  const preporukaPoKodu = new Map(preporuke.map((p) => [p.kod, p]));
  const cekaju = recenzije.filter((r) => r.status === "ceka");
  const ostale = recenzije.filter((r) => r.status !== "ceka");

  const kartice = [
    { naziv: "Mailova nakon isporuke", vrijednost: mailovaPoslano },
    { naziv: "Recenzija čeka", vrijednost: cekaju.length },
    { naziv: "Objavljenih recenzija", vrijednost: recenzije.filter((r) => r.status === "odobreno").length },
    {
      naziv: "Prijatelja naručilo",
      vrijednost: koristenja.filter((k) => !k.ponistenoAt).length,
    },
  ];

  function RedRecenzije({ r }: { r: (typeof recenzije)[number] }) {
    return (
      <div className="rounded-xl bg-card p-4 ring-1 ring-border">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            <span className="text-[#C9A15B]">{zvjezdice(r.ocjena)}</span>{" "}
            <span className="font-medium text-foreground">{r.ime}</span>{" "}
            <span className="text-muted-foreground">
              · {getProductBySlug(r.slug)?.naziv ?? r.slug} · {r.brojNarudzbe} · {datum(r.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{NAZIV_STATUSA[r.status] ?? r.status}</span>
            {r.status !== "odobreno" && (
              <form action={postaviStatusRecenzije}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="odobreno" />
                <Button type="submit" size="sm" variant="cta">
                  Objavi
                </Button>
              </form>
            )}
            {r.status !== "odbijeno" && (
              <form action={postaviStatusRecenzije}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value="odbijeno" />
                <Button type="submit" size="sm" variant="outline">
                  Sakrij
                </Button>
              </form>
            )}
          </div>
        </div>
        {r.komentar ? (
          <p className="mt-2 text-sm text-foreground">{r.komentar}</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Bez komentara (samo ocjena)</p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">Recenzije i preporuke</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mail ide automatski 4 dana nakon &quot;Poslano&quot;. Recenzija je na sajtu tek kad je objavite.
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        <div className="mt-6">
          <AdminNav aktivno="recenzije" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {kartice.map((k) => (
            <div key={k.naziv} className="rounded-xl bg-card p-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">{k.naziv}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{k.vrijednost}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-heading text-xl font-normal text-foreground">Čekaju odobrenje</h2>
        <div className="mt-4 space-y-3">
          {cekaju.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema novih recenzija.</p>
          ) : (
            cekaju.map((r) => <RedRecenzije key={r.id} r={r} />)
          )}
        </div>

        {ostale.length > 0 && (
          <>
            <h2 className="mt-10 font-heading text-xl font-normal text-foreground">Ranije recenzije</h2>
            <div className="mt-4 space-y-3">
              {ostale.map((r) => (
                <RedRecenzije key={r.id} r={r} />
              ))}
            </div>
          </>
        )}

        <h2 className="mt-12 font-heading text-xl font-normal text-foreground">Preporuke</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prijatelj naruči preko linka → kupac dobija svoj kod 7 dana nakon što prijateljevu narudžbu
          označite &quot;Poslano&quot; (ako nije vraćena).
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl bg-card ring-1 ring-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Preporučio</th>
                <th className="px-4 py-3 font-medium">Prijatelj</th>
                <th className="px-4 py-3 font-medium">Narudžba</th>
                <th className="px-4 py-3 font-medium">Nagrada</th>
              </tr>
            </thead>
            <tbody>
              {koristenja.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Još niko nije naručio preko linka preporuke.
                  </td>
                </tr>
              ) : (
                koristenja.map((k) => {
                  const p = preporukaPoKodu.get(k.preporukaKod);
                  return (
                    <tr key={k.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{datum(k.createdAt)}</td>
                      <td className="px-4 py-3 text-foreground">
                        {p ? `${p.ime} (${p.email})` : k.preporukaKod}
                        <span className="block font-mono text-xs text-muted-foreground">{k.preporukaKod}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{k.emailPrijatelja}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{k.brojNarudzbe}</td>
                      <td className="px-4 py-3 text-xs">
                        {k.ponistenoAt ? (
                          <span className="text-muted-foreground">Poništeno (vraćeno)</span>
                        ) : k.nagradaKod ? (
                          <span className="text-foreground">
                            {k.nagradaKod}
                            {k.nagradaPoslanaAt ? " · mail poslan" : " · mail NIJE poslan"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Čeka (7 dana nakon slanja)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
