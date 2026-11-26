"use client";

// Kutija "Poklonite prijatelju 10%" (korisnik, 26.11.2026) — na /recenzija/ i /podijeli/. Dugmad za
// Viber/WhatsApp su OVDJE na sajtu, ne u mailu: Gmail blokira viber:// linkove u mailovima.
// `otvori` = "viber" | "whatsapp" → odmah otvori tu aplikaciju (dugmad iz maila vode na
// /podijeli/KOD/?na=viber). Kod se pamti kao "moj kod", pa ga popup ne primijeni kupcu samom sebi.

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const MOJ_KOD_KLJUC = "aurelia-moj-kod-preporuke";

export function porukaZaPrijatelja(link: string, procenat: number): string {
  return `Poklanjam ti ${procenat}% na proizvode iz Aurelia asortimana: ${link}`;
}

export function PreporukaKutija({
  kod,
  link,
  procenat,
  maksPrijatelja,
  otvori,
}: {
  kod: string;
  link: string;
  procenat: number;
  maksPrijatelja: number;
  otvori?: string | null;
}) {
  const [kopirano, setKopirano] = useState(false);
  const poruka = porukaZaPrijatelja(link, procenat);
  const viber = `viber://forward?text=${encodeURIComponent(poruka)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(poruka)}`;

  useEffect(() => {
    try {
      localStorage.setItem(MOJ_KOD_KLJUC, kod);
      // Ako je kupac ranije kliknuo svoj link, njegov kod ne smije stajati kao "primijenjen" u korpi.
      if (localStorage.getItem("aurelia-promo") === kod) localStorage.removeItem("aurelia-promo");
    } catch {
      // storage nedostupan
    }
    if (otvori === "viber") window.location.href = viber;
    else if (otvori === "whatsapp") window.location.href = whatsapp;
  }, [kod, otvori, viber, whatsapp]);

  async function kopiraj() {
    try {
      await navigator.clipboard.writeText(poruka);
      setKopirano(true);
      setTimeout(() => setKopirano(false), 2000);
    } catch {
      // clipboard nedostupan — link je vidljiv i može se označiti ručno
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-normal text-foreground">
        Poklonite prijatelju {procenat}%
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ovo je vaš lični link za prijatelje — vama ne daje popust. Prijatelj dobija {procenat}% na
        prvu narudžbu, a vi za svakog ko naruči dobijate svoj kod za {procenat}% na mail — do{" "}
        {maksPrijatelja} prijatelja.
      </p>
      <div className="mt-4 flex gap-2">
        <Input
          readOnly
          value={link}
          className="font-mono text-xs"
          onFocus={(e) => e.target.select()}
          aria-label="Vaš link za prijatelje"
        />
        <Button type="button" variant="outline" onClick={kopiraj} className="shrink-0">
          {kopirano ? "Kopirano" : "Kopiraj"}
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={viber} className="rounded-lg bg-[#7360F2] px-4 py-2 text-sm font-medium text-white">
          Pošalji na Viber
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white"
        >
          Pošalji na WhatsApp
        </a>
      </div>
    </div>
  );
}
