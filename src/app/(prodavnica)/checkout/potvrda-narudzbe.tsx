// Prikaz nakon uspješnog POST-a na /api/narudzbe. Korisnik (23.08.2026) je eksplicitno rekao da
// NEMA telefonskog kontakta radi potvrde — narudžba je potvrđena odmah, potvrda + info o isporuci
// idu isključivo na email. Ovo POJAČAVA prioritet TODO backend napomene u
// src/app/api/narudzbe/route.ts (email MORA biti povezan prije lansiranja — sad je jedini kanal
// potvrde, nema više telefona kao alternative/fallbacka).

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function PotvrdaNarudzbe({ brojNarudzbe }: { brojNarudzbe: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4">Hvala na narudžbi!</h1>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        Vaša narudžba pod brojem <span className="font-semibold">#{brojNarudzbe}</span> je potvrđena.
        Potvrdu narudžbe i informacije o isporuci šaljemo na email koji ste unijeli.
      </p>
      <Link
        href="/shop/"
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_18%)]"
      >
        Nastavi kupovinu
      </Link>
    </div>
  );
}
