// /nagradna-igra/ (korisnik, 21.11.2026) — prijava preko sajta (email + Instagram ime), svaki
// učesnik odmah dobija lični kod za 10%. Datumi/nagrade/profil: src/lib/nagradna-igra.ts.
// Dinamička stranica jer forma zavisi od trenutnog vremena (prije/tokom/poslije igre).

import type { Metadata } from "next";
import Link from "next/link";

import {
  INSTAGRAM_PROFIL,
  INSTAGRAM_URL,
  NAGRADNA_IGRA,
  statusIgre,
} from "@/lib/nagradna-igra";
import { getProductBySlug } from "@/lib/products";

import { NagradnaForma } from "./forma";

const SITE_URL = "https://aurelia.ba";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nagradna igra — osvojite posteljinu od damasta | Aurelia.ba",
  description: `Osvojite Aurelia posteljinu od pamučnog damasta. Prijava ${NAGRADNA_IGRA.trajanjeTekst} — svaki učesnik odmah dobija kod za 10% popusta.`,
  alternates: { canonical: `${SITE_URL}/nagradna-igra/` },
};

export default function NagradnaIgraPage() {
  const status = statusIgre();
  const nagrade = NAGRADNA_IGRA.nagrade.map((n) => ({
    ...n,
    proizvod: getProductBySlug(n.slug),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-eyebrow text-primary">Nagradna igra</p>
        <h1 className="mt-3">Osvojite Aurelia posteljinu od damasta</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Poklanjamo posteljinu od 100% pamučnog damasta — dobitnik bira jednu
          od dvije nagrade. Prijava traje {NAGRADNA_IGRA.trajanjeTekst}, a svaki
          učesnik odmah na email dobija lični kod za 10% popusta.
        </p>
      </div>

      <section aria-labelledby="nagrade" className="mt-12">
        <h2 id="nagrade">Nagrada po izboru</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {nagrade.map((n, i) => (
            <div
              key={n.slug}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              {n.proizvod?.slike[0] && (
                <div className="aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- lokalna slika, isti obrazac kao o-nama */}
                  <img
                    src={n.proizvod.slike[0].url}
                    alt={n.proizvod.slike[0].alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                  Opcija {i + 1}
                </p>
                <h3 className="mt-1">{n.naziv}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {n.sadrzaj}
                </p>
                {n.proizvod && (
                  <Link
                    href={`/shop/${n.slug}/`}
                    className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Pogledaj proizvod
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <section aria-labelledby="kako">
          <h2 id="kako">Kako učestvovati</h2>
          <ol className="mt-6 space-y-5">
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Zapratite nas na Instagramu
                </p>
                <p className="text-muted-foreground">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    @{INSTAGRAM_PROFIL}
                  </a>{" "}
                  — praćenje profila je uslov za nagradu.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Prijavite se ovdje
                </p>
                <p className="text-muted-foreground">
                  Email i Instagram ime — i odmah dobijate kod za 10% popusta.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Bonus: označite jednu osobu
                </p>
                <p className="text-muted-foreground">
                  U komentaru ispod naše objave nagradne igre označite osobu
                  kojoj biste poklonili novu posteljinu.
                </p>
              </div>
            </li>
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Dobitnika izvlačimo nasumično {NAGRADNA_IGRA.izvlacenjeTekst} i
            objavljujemo na Instagramu. Kupovina nije uslov za učešće i ne utiče
            na šanse.
          </p>
        </section>

        <div>
          {status === "aktivna" && (
            <NagradnaForma
              instagramUrl={INSTAGRAM_URL}
              instagramProfil={INSTAGRAM_PROFIL}
            />
          )}
          {status === "uskoro" && (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-heading text-2xl text-foreground">
                Prijave počinju uskoro
              </p>
              <p className="mt-2 text-muted-foreground">
                Nagradna igra traje {NAGRADNA_IGRA.trajanjeTekst}.
              </p>
            </div>
          )}
          {status === "zavrsena" && (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-heading text-2xl text-foreground">
                Nagradna igra je završena
              </p>
              <p className="mt-2 text-muted-foreground">
                Hvala svima na učešću! Dobitnika smo objavili na{" "}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Instagramu
                </a>
                .
              </p>
              <Link
                href="/shop/"
                className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Pogledaj ponudu
              </Link>
            </div>
          )}
        </div>
      </div>

      <section
        id="pravila"
        aria-labelledby="pravila-naslov"
        className="mt-16 max-w-3xl scroll-mt-24"
      >
        <h2 id="pravila-naslov">Pravila nagradne igre</h2>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Organizator nagradne igre je Aurelia (aurelia.ba), Derviša Numića 4, Bosna i
            Hercegovina.
          </li>
          <li>Nagradna igra traje {NAGRADNA_IGRA.trajanjeTekst} (do 23:59).</li>
          <li>
            Pravo učešća imaju punoljetne osobe s adresom za dostavu u Bosni i
            Hercegovini. Zaposleni kod organizatora i članovi njihovih porodica
            ne mogu učestvovati.
          </li>
          <li>
            Učestvuje se prijavom na ovoj stranici (email i Instagram korisničko
            ime). Svaka osoba se može prijaviti jednom. Uslov za dodjelu nagrade
            je da dobitnik u trenutku izvlačenja prati Instagram profil @
            {INSTAGRAM_PROFIL}.
          </li>
          <li>Kupovina nije uslov za učešće i ne utiče na šanse za dobitak.</li>
          <li>
            Dobitnik se izvlači nasumično {NAGRADNA_IGRA.izvlacenjeTekst} među
            svim važećim prijavama. Ako dobitnik ne ispunjava uslove ili se ne
            javi u roku od 5 dana od obavještenja na email, izvlači se novi
            dobitnik.
          </li>
          <li>
            Nagrada: po izboru dobitnika „{NAGRADNA_IGRA.nagrade[0].naziv}” ili
            „{NAGRADNA_IGRA.nagrade[1].naziv}”. Nagrada se ne može zamijeniti za
            novac. Dostava nagrade je besplatna.
          </li>
          <li>
            Kod za 10% popusta koji učesnici dobiju na email važi za jednu
            narudžbu, odnosi se na proizvode (ne na dostavu) i nije povezan s
            ishodom izvlačenja.
          </li>
          <li>
            Podatke učesnika koristimo za provođenje nagradne igre i slanje
            Aurelia ponuda u skladu s našom{" "}
            <Link
              href="/politika-privatnosti/"
              className="text-primary underline-offset-4 hover:underline"
            >
              politikom privatnosti
            </Link>
            . Ime dobitnika (Instagram korisničko ime) objavljujemo na
            Instagramu.
          </li>
          <li>
            Nagradnu igru ni na koji način ne sponzoriše, ne podržava niti
            provodi Instagram, niti je s njim povezana.
          </li>
        </ol>
      </section>
    </div>
  );
}
