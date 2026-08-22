// Minimalna 404 stranica — CLAUDE_aurelia.md §10 "Prije lansiranja: 404 stranica sa linkom na
// shop". Nije bila fokus zadatka (proizvodna stranica), ali `notFound()` na nepostojećem slugu
// (src/app/shop/[slug]/page.tsx) bi bez ovog fajla pao na Next.js default 404 — brzo se pravi i
// sprječava loš UX.

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-eyebrow text-primary">404</p>
      <h1 className="mt-3 font-heading text-3xl font-normal text-foreground md:text-4xl">
        Stranica nije pronađena
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
        Stranica koju tražite ne postoji ili je uklonjena. Pogledajte cijelu ponudu posteljine
        ispod.
      </p>
      <Link
        href="/shop/"
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90"
      >
        Pogledaj ponudu
      </Link>
    </div>
  );
}
