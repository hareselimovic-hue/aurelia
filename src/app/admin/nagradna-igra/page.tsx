import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { NAGRADNA_IGRA, statusIgre } from "@/lib/nagradna-igra";
import { prisma } from "@/lib/prisma";

import { AdminNav } from "../admin-nav";
import { OdjaviSeDugme } from "../narudzbe/odjavi-se-dugme";
import { izvuciDobitnika } from "./actions";

export const dynamic = "force-dynamic";

const NAZIV_STATUSA = {
  uskoro: "Još nije počela",
  aktivna: "U toku",
  zavrsena: "Završena",
} as const;

function datum(d: Date): string {
  return d.toLocaleString("bs-BA", {
    timeZone: "Europe/Sarajevo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminNagradnaIgraPage() {
  const prijave = await prisma.nagradnaPrijava.findMany({
    where: { igra: NAGRADNA_IGRA.kljuc },
    orderBy: { createdAt: "desc" },
  });

  const kodovi = prijave
    .map((p) => p.kod)
    .filter((k): k is string => Boolean(k));
  const promoZapisi = kodovi.length
    ? await prisma.promoKod.findMany({ where: { kod: { in: kodovi } } })
    : [];
  const promoPoKodu = new Map(promoZapisi.map((z) => [z.kod, z]));

  const brojeviNarudzbi = promoZapisi
    .map((z) => z.brojNarudzbe)
    .filter((b): b is string => Boolean(b));
  const narudzbe = brojeviNarudzbi.length
    ? await prisma.narudzba.findMany({
        where: { brojNarudzbe: { in: brojeviNarudzbi } },
        select: { ukupnaCijena: true },
      })
    : [];
  const prihod = narudzbe.reduce((zbir, n) => zbir + Number(n.ukupnaCijena), 0);

  const izvuceni = prijave
    .filter((p) => p.izvucenAt)
    .sort((a, b) => a.izvucenAt!.getTime() - b.izvucenAt!.getTime());
  const status = statusIgre();

  const kartice = [
    { naziv: "Prijava", vrijednost: String(prijave.length) },
    { naziv: "Dobili kod", vrijednost: String(kodovi.length) },
    { naziv: "Iskoristili kod", vrijednost: String(brojeviNarudzbi.length) },
    { naziv: "Prihod od tih narudžbi", vrijednost: formatPrice(prihod) },
  ];

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">
              Nagradna igra
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {NAGRADNA_IGRA.trajanjeTekst} · izvlačenje{" "}
              {NAGRADNA_IGRA.izvlacenjeTekst} ·{" "}
              <span className="font-medium text-foreground">
                {NAZIV_STATUSA[status]}
              </span>
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        <div className="mt-6">
          <AdminNav aktivno="nagradna-igra" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {kartice.map((k) => (
            <div
              key={k.naziv}
              className="rounded-xl bg-card p-4 ring-1 ring-border"
            >
              <p className="text-xs text-muted-foreground">{k.naziv}</p>
              <p className="mt-1 text-2xl font-medium text-foreground">
                {k.vrijednost}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-card p-5 ring-1 ring-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Izvlačenje</p>
              <p className="text-sm text-muted-foreground">
                Nasumično iz svih prijava. Provjerite da dobitnik prati profil —
                ako ne, izvucite ponovo (rezervni dobitnik).
              </p>
            </div>
            <form action={izvuciDobitnika}>
              <Button
                type="submit"
                variant="cta"
                disabled={prijave.length === izvuceni.length}
              >
                {izvuceni.length ? "Izvuci ponovo" : "Izvuci dobitnika"}
              </Button>
            </form>
          </div>
          {izvuceni.length > 0 && (
            <ol className="mt-4 space-y-2">
              {izvuceni.map((p, i) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-secondary px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">{i + 1}.</span>
                  <a
                    href={`https://www.instagram.com/${p.instagram}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    @{p.instagram}
                  </a>
                  <a
                    href={`mailto:${p.email}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {p.email}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    izvučen {datum(p.izvucenAt!)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl bg-card ring-1 ring-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Prijava</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Instagram</th>
                <th className="px-4 py-3 font-medium">Kod</th>
              </tr>
            </thead>
            <tbody>
              {prijave.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Još nema prijava.
                  </td>
                </tr>
              )}
              {prijave.map((p) => {
                const promo = p.kod ? promoPoKodu.get(p.kod) : undefined;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {datum(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.email}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://www.instagram.com/${p.instagram}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        @{p.instagram}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {!p.kod && (
                        <span className="text-muted-foreground">
                          — (popust već iskorišten)
                        </span>
                      )}
                      {p.kod && (
                        <span className="font-mono text-xs text-foreground">
                          {p.kod}
                          {promo?.brojNarudzbe && (
                            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 font-sans text-secondary-foreground">
                              kupio · {promo.brojNarudzbe}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
