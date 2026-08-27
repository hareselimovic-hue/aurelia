// KONTAKT — CLAUDE_aurelia.md §2. Jednostavna kontakt-info stranica, bez forme za slanje poruke
// (nije eksplicitno tražena). Telefon uklonjen (korisnik, 27.08.2026) — bio je izmišljen
// placeholder ("+387 60 000 000"), stvaran broj još nije potvrđen. Header/Footer su globalni, ne
// ponavljaju se ovdje.

import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

const SITE_URL = "https://aurelia.ba";

export const metadata: Metadata = {
  title: "Kontakt | Aurelia.ba",
  description: "Kontaktirajte Aurelia tim emailom za pitanja o proizvodima, narudžbama i zamjenama.",
  alternates: {
    canonical: `${SITE_URL}/kontakt/`,
  },
};

const KONTAKT_KARTICE = [
  {
    naslov: "Email",
    Ikonica: Mail,
    sadrzaj: (
      <a href="mailto:info@aurelia.ba" className="text-primary underline-offset-4 hover:underline">
        info@aurelia.ba
      </a>
    ),
    napomena: "Odgovaramo u toku radnih dana.",
  },
  {
    naslov: "Adresa",
    Ikonica: MapPin,
    sadrzaj: <span className="text-foreground">Aurelia d.o.o.</span>,
    napomena: "Adresa uskoro — Bosna i Hercegovina.",
  },
] as const;

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <h1>Kontakt</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Imate pitanje o proizvodu, narudžbi ili dostavi? Javite nam se emailom — rado ćemo
          odgovoriti, pogotovo kad je u pitanju zamjena veličine ili nešto vezano za već poslanu
          narudžbu.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {KONTAKT_KARTICE.map(({ naslov, Ikonica, sadrzaj, napomena }) => (
          <div key={naslov} className="flex flex-col rounded-xl bg-card p-6 ring-1 ring-border">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
              <Ikonica className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4">{naslov}</h3>
            <p className="mt-2">{sadrzaj}</p>
            <p className="mt-1 text-sm text-muted-foreground">{napomena}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
