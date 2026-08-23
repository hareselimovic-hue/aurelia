// Footer (dijeljena komponenta) — CLAUDE_aurelia.md §4-10 / §10-04:
// "4 kolone: podaci o firmi (u <address>) · linkovi na kategorije · pravne stranice ·
// društvene mreže."
// Legal stranice i /o-nama/ /kontakt/ rute još ne postoje kao stranice — to je u redu, prave se
// u sljedećim koracima (skica ruta je već u CLAUDE_aurelia.md §2).

import Link from "next/link";

const KATEGORIJE = [
  { naziv: "Cijela ponuda", href: "/shop/" },
  { naziv: "Posteljina od damasta", href: "/shop/?kategorija=posteljina" },
  { naziv: "Peškiri", href: "/shop/?kategorija=peskiri" },
  { naziv: "Čaršafi", href: "/shop/?kategorija=carsafi" },
];

const PRAVNE_STRANICE = [
  { naziv: "Dostava i plaćanje", href: "/dostava-i-placanje/" },
  { naziv: "Reklamacije i povrat", href: "/reklamacije-i-povrat/" },
  { naziv: "Uslovi korištenja", href: "/uslovi-koristenja/" },
  { naziv: "Politika privatnosti", href: "/politika-privatnosti/" },
];

// TODO: društvene mreže — pravi linkovi čekaju korisnika (nalozi možda još ne postoje).
const DRUSTVENE_MREZE = [
  { naziv: "Instagram", href: "#" },
  { naziv: "Facebook", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Kolona 1 — podaci o firmi */}
          <div>
            <p className="font-heading text-lg font-medium text-foreground">Aurelia</p>
            {/*
              TODO: PIB/ID broj još nije poslan — ne izmišljati, dodati kad korisnik pošalje.
            */}
            <address className="mt-3 space-y-1 text-sm not-italic text-muted-foreground">
              <p>TB d.o.o.</p>
              <p>Derviša Numića 4, Bosna i Hercegovina</p>
              <p>
                <a href="mailto:info@aurelia.ba" className="hover:text-primary">
                  info@aurelia.ba
                </a>
              </p>
            </address>
          </div>

          {/* Kolona 2 — kategorije */}
          <div>
            <p className="text-eyebrow text-foreground">Kupovina</p>
            <ul className="mt-3 space-y-2">
              {KATEGORIJE.map((stavka) => (
                <li key={stavka.href}>
                  <Link
                    href={stavka.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {stavka.naziv}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolona 3 — pravne stranice */}
          <div>
            <p className="text-eyebrow text-foreground">Informacije</p>
            <ul className="mt-3 space-y-2">
              {PRAVNE_STRANICE.map((stavka) => (
                <li key={stavka.href}>
                  <Link
                    href={stavka.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {stavka.naziv}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolona 4 — društvene mreže */}
          <div>
            <p className="text-eyebrow text-foreground">Pratite nas</p>
            <ul className="mt-3 space-y-2">
              {DRUSTVENE_MREZE.map((stavka) => (
                <li key={stavka.naziv}>
                  <a
                    href={stavka.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {stavka.naziv}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Aurelia. Sva prava zadržana.</p>
        </div>
      </div>
    </footer>
  );
}
