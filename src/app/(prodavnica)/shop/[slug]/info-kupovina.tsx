// Info kutija ispod "Dodaj u korpu" (korisnik, 25.11.2026 — odabrana verzija C): stanje + rok slanja,
// dostava, plaćanje/zamjena. Baymard: informacije o dostavi odmah oko "Buy" dijela, ne unutar njega.
// Cijena dostave iz src/lib/dostava.ts (isti izvor kao checkout), rok slanja 48 h (korisnik).

import { Banknote, Truck } from "lucide-react";

import { CIJENA_DOSTAVE } from "@/lib/dostava";
import { formatPrice } from "@/lib/format";

const ROK_SLANJA = "48 sati";

export function InfoKupovina({ naStanju }: { naStanju: boolean }) {
  return (
    <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card px-4 text-sm leading-snug text-foreground sm:px-5">
      {naStanju && (
        <li className="flex items-center gap-3 py-3">
          <span className="flex w-[18px] shrink-0 justify-center" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#3E8E5A] shadow-[0_0_0_3px_rgba(62,142,90,0.18)]" />
          </span>
          <span>
            <strong className="font-semibold text-[#2F6E45]">Na stanju</strong> — šaljemo u roku od{" "}
            {ROK_SLANJA}
          </span>
        </li>
      )}
      <li className="flex items-center gap-3 py-3">
        <Truck className="size-[18px] shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
        <span>
          Dostava {formatPrice(CIJENA_DOSTAVE)} ·{" "}
          <span className="text-muted-foreground">Sarajevo besplatno</span>
        </span>
      </li>
      <li className="flex items-center gap-3 py-3">
        <Banknote className="size-[18px] shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
        <span>
          Plaćanje pouzećem ·{" "}
          <span className="text-muted-foreground">zamjena 14 dana</span>
        </span>
      </li>
    </ul>
  );
}
