// /poklon/[kod]/ (korisnik, 26.11.2026) — link koji kupac šalje prijatelju. Posebna stranica da bi
// pregled linka u Viberu/WhatsAppu imao naslov "Poklanjam ti 10% na proizvode iz Aurelia asortimana"
// (početna ima svoj SEO naslov). Kod se pamti kao promo kod (isti mehanizam kao ?promo=).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PREPORUKA_PROCENAT } from "@/lib/preporuke-konstante";

import { SacuvajPoklon } from "./sacuvaj-poklon";

export const dynamic = "force-dynamic";

const NASLOV = `Poklanjam ti ${PREPORUKA_PROCENAT}% na proizvode iz Aurelia asortimana`;
const OPIS = "Posteljina, peškiri i čaršafi od 100% pamuka. Dostava po cijeloj BiH, plaćanje pouzećem.";

async function nadjiPreporuku(kod: string) {
  return prisma.preporuka.findUnique({ where: { kod: decodeURIComponent(kod).toUpperCase() } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kod: string }>;
}): Promise<Metadata> {
  const { kod } = await params;
  const url = `https://aurelia.ba/poklon/${encodeURIComponent(kod)}/`;
  return {
    title: `${NASLOV} | Aurelia.ba`,
    description: OPIS,
    robots: { index: false, follow: false },
    openGraph: {
      title: NASLOV,
      description: OPIS,
      url,
      siteName: "Aurelia",
      locale: "bs_BA",
      type: "website",
      images: [{ url: "https://aurelia.ba/og/poklon.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function PoklonPage({ params }: { params: Promise<{ kod: string }> }) {
  const { kod } = await params;
  const preporuka = await nadjiPreporuku(kod);
  if (!preporuka) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 md:py-24">
      <SacuvajPoklon kod={preporuka.kod} />
      <p className="text-eyebrow text-primary">Poklon od: {preporuka.ime}</p>
      <h1 className="mt-3">{PREPORUKA_PROCENAT}% popusta na vašu prvu narudžbu</h1>
      <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
        {preporuka.ime} vam poklanja {PREPORUKA_PROCENAT}% na proizvode iz Aurelia asortimana —
        posteljinu, peškire i čaršafe od 100% pamuka. Popust se sam primjenjuje u korpi.
      </p>
      <Link
        href={`/shop/?promo=${encodeURIComponent(preporuka.kod)}`}
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-cta px-8 text-sm font-medium text-cta-foreground"
      >
        Pogledajte ponudu
      </Link>
      <p className="mt-6 text-xs text-muted-foreground">
        Važi za prvu narudžbu na aurelia.ba. Popust se ne odnosi na dostavu.
      </p>
    </div>
  );
}
