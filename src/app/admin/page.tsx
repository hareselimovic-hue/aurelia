import Link from "next/link";

import { formatPrice } from "@/lib/format";
import {
  grupisiPoMjesecima,
  izracunajBestsellere,
  pronadjiNiskuZalihu,
} from "@/lib/dashboard-stats";
import { getAllProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import type { NarudzbaStavka } from "@/app/api/narudzbe/types";

import { AdminNav } from "./admin-nav";
import { OdjaviSeDugme } from "./narudzbe/odjavi-se-dugme";

// Dashboard je sad primarna /admin/ stranica (korisnik, 10.10.2026 — "dashboard bude prva
// stranica, prvi tab, primarni link"). Ranije je ovdje bio samo `redirect("/admin/narudzbe/")`;
// taj redirect je uklonjen, i post-login redirekcija (src/app/admin/login/page.tsx) i dalje vodi
// ovdje preko "/admin/" (ne mijenja se, već je bila "/admin/narudzbe/" pa je samo cilj izmijenjen).
export const dynamic = "force-dynamic";

const BROJ_MJESECI_PRIKAZ = 6;

export default async function AdminDashboardPage() {
  const [sveNarudzbe, zalihaRedovi] = await Promise.all([
    prisma.narudzba.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.zaliha.findMany(),
  ]);

  const mjesecnaStatistika = grupisiPoMjesecima(
    sveNarudzbe.map((n) => ({ createdAt: n.createdAt, ukupnaCijena: Number(n.ukupnaCijena) }))
  ).slice(0, BROJ_MJESECI_PRIKAZ);

  const bestseleri = izracunajBestsellere(
    sveNarudzbe.map((n) => n.stavke as unknown as NarudzbaStavka[])
  );

  const kolicinaPoSlugu = new Map(zalihaRedovi.map((r) => [r.slug, r.kolicina]));
  const niskaZaliha = pronadjiNiskuZalihu(getAllProducts(), kolicinaPoSlugu);

  const brojNovih = sveNarudzbe.filter((n) => n.status === "nova").length;

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">Dashboard</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {sveNarudzbe.length} narudžbi ukupno · {brojNovih} {brojNovih === 1 ? "nova" : "novih"}
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        <div className="mt-6">
          <AdminNav aktivno="dashboard" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Narudžbe po mjesecu */}
          <div className="rounded-xl bg-card p-6 ring-1 ring-border">
            <p className="font-heading text-lg font-medium text-foreground">Narudžbe po mjesecu</p>
            {mjesecnaStatistika.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Još nema narudžbi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="mt-4 w-full min-w-[320px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="py-2 font-medium">Mjesec</th>
                      <th className="py-2 text-right font-medium">Narudžbi</th>
                      <th className="py-2 text-right font-medium">Ukupno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mjesecnaStatistika.map((m) => (
                      <tr key={m.mjesec} className="border-b border-border last:border-0">
                        <td className="py-2 text-foreground">{m.naziv}</td>
                        <td className="py-2 text-right text-foreground">{m.brojNarudzbi}</td>
                        <td className="py-2 text-right font-medium text-foreground">
                          {formatPrice(m.ukupnaCijena)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Najprodavaniji artikli */}
          <div className="rounded-xl bg-card p-6 ring-1 ring-border">
            <p className="font-heading text-lg font-medium text-foreground">
              Najprodavaniji artikli
            </p>
            {bestseleri.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Još nema narudžbi.</p>
            ) : (
              <ol className="mt-4 flex flex-col gap-2 text-sm">
                {bestseleri.map((b, i) => (
                  <li
                    key={b.slug}
                    className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-foreground">
                      <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                      {b.naziv}
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-medium text-foreground">
                      {b.kolicina} kom
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Niska zaliha */}
          <div className="rounded-xl bg-card p-6 ring-1 ring-border lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="font-heading text-lg font-medium text-foreground">Niska zaliha</p>
              <Link
                href="/admin/zaliha/"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Uredi zalihu →
              </Link>
            </div>
            {niskaZaliha.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Sve u redu — nijedan artikal nije ispod praga.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {niskaZaliha.map((p) => (
                  <li
                    key={p.slug}
                    className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-foreground">{p.naziv}</span>
                    <span
                      className={`shrink-0 whitespace-nowrap font-medium ${p.kolicina <= 0 ? "text-destructive" : "text-foreground"}`}
                    >
                      {p.kolicina} kom
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
