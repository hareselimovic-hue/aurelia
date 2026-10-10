import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { getAllProducts } from "@/lib/products";

import { AdminNav } from "../admin-nav";
import { OdjaviSeDugme } from "../narudzbe/odjavi-se-dugme";
import { azurirajZalihu } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminZalihaPage() {
  const proizvodi = getAllProducts();
  const redovi = await prisma.zaliha.findMany();
  const kolicinaPoSlugu = new Map(redovi.map((r) => [r.slug, r.kolicina]));

  return (
    <main className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl font-medium text-foreground">Zaliha</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ručno uneseno stanje po proizvodu — ne utiče na prodavnicu, samo pregled.
            </p>
          </div>
          <OdjaviSeDugme />
        </div>

        <div className="mt-6">
          <AdminNav aktivno="zaliha" />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl bg-card ring-1 ring-border">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Proizvod</th>
                <th className="px-4 py-3 font-medium">Trenutna zaliha</th>
                <th className="px-4 py-3 font-medium">Novo stanje</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {proizvodi.map((proizvod) => {
                const trenutno = kolicinaPoSlugu.get(proizvod.slug) ?? 0;
                const jeBundle = Boolean(proizvod.komponente && proizvod.komponente.length > 0);
                return (
                  <tr key={proizvod.slug} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {proizvod.naziv}
                      {jeBundle && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Set — skida se iz komponenti, ne iz ovog reda
                        </p>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        trenutno < 0 ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {trenutno}
                    </td>
                    <td className="px-4 py-3">
                      <form action={azurirajZalihu} className="flex items-center gap-2">
                        <input type="hidden" name="slug" value={proizvod.slug} />
                        <Input
                          type="number"
                          name="kolicina"
                          defaultValue={trenutno}
                          className="h-9 w-24"
                          aria-label={`Nova količina za ${proizvod.naziv}`}
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Sačuvaj
                        </Button>
                      </form>
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
