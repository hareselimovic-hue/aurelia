// Zaliha po proizvodu — admin-only pregled (korisnik, 10.10.2026), namjerno NEPOVEZANO sa
// checkout/shop stranicama (ne blokira kupovinu, samo signal vlasniku u adminu). Jedina
// automatika je skidanje sa zalihe kad se narudžba označi poslano (src/app/admin/narudzbe/
// actions.ts) — ova funkcija je čista logika razlaganja stavki, bez pristupa bazi, da se može
// testirati nezavisno i koristiti i iz server akcije i (po potrebi) iz skripte/testa.

import { getProductBySlug } from "@/lib/products";
import type { NarudzbaStavka } from "@/app/api/narudzbe/types";

/**
 * Pretvara stavke narudžbe u mapu (slug proizvoda -> količina za skidanje sa zalihe). "Puni set"
 * proizvodi (imaju `komponente` u products.ts) se razlažu na stvarne komponente umjesto da se
 * njihov vlastiti slug skida — set se ne drži kao zaseban fizički artikal na zalihi, sastavlja
 * se iz istih komada koji se prodaju i pojedinačno.
 */
export function izracunajSkidanjeZalihe(stavke: NarudzbaStavka[]): Map<string, number> {
  const skidanje = new Map<string, number>();

  function dodaj(slug: string, kolicina: number) {
    skidanje.set(slug, (skidanje.get(slug) ?? 0) + kolicina);
  }

  for (const stavka of stavke) {
    const proizvod = getProductBySlug(stavka.slug);
    if (proizvod?.komponente && proizvod.komponente.length > 0) {
      for (const komponenta of proizvod.komponente) {
        dodaj(komponenta.slug, komponenta.kolicina * stavka.kolicina);
      }
    } else {
      dodaj(stavka.slug, stavka.kolicina);
    }
  }

  return skidanje;
}
