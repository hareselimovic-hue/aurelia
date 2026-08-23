// Slanje mailova nakon narudžbe — vidi route.ts TODO (23.08.2026): email je JEDINI kanal potvrde
// obećan kupcu na checkout formi, i jedini način da vlasnik sazna za novu narudžbu (nema telefona).
// Provajder: Resend, domen aurelia.ba verifikovan (DKIM + SPF na send.aurelia.ba poddomenu).

import { Resend } from "resend";

import { formatPrice } from "@/lib/format";

import type { NacinPlacanja, NarudzbaKupac, NarudzbaStavka } from "./types";

const OD_ADRESA = "Aurelia <narudzbe@aurelia.ba>";
const VLASNIK_EMAIL = "info@aurelia.ba";

const NAZIVI_NACINA_PLACANJA: Record<NacinPlacanja, string> = {
  pouzece: "Pouzeće",
  "bankovni-transfer": "Bankovni transfer",
  kartica: "Kartica (online plaćanje)",
};

function getResendKlijent(): Resend | null {
  const kljuc = process.env.RESEND_API_KEY;
  if (!kljuc) return null;
  return new Resend(kljuc);
}

function stavkeHtml(stavke: NarudzbaStavka[]): string {
  return stavke
    .map(
      (s) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EFE2C5;">
          ${s.naziv}${s.dimenzija ? `<br><span style="color:#6b6459;font-size:13px;">${s.dimenzija}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EFE2C5;text-align:center;">${s.kolicina}×</td>
        <td style="padding:8px 0;border-bottom:1px solid #EFE2C5;text-align:right;">${formatPrice(s.cijenaPoKomadu * s.kolicina)}</td>
      </tr>`
    )
    .join("");
}

function stavkeTekst(stavke: NarudzbaStavka[]): string {
  return stavke
    .map(
      (s) =>
        `- ${s.naziv}${s.dimenzija ? ` (${s.dimenzija})` : ""} x${s.kolicina} @ ${formatPrice(s.cijenaPoKomadu)} = ${formatPrice(s.cijenaPoKomadu * s.kolicina)}`
    )
    .join("\n");
}

type NarudzbaZaEmail = {
  brojNarudzbe: string;
  kupac: NarudzbaKupac;
  nacinPlacanja: NacinPlacanja;
  stavke: NarudzbaStavka[];
  ukupnaCijena: number;
};

/** Potvrda kupcu — obećana na checkout formi kao JEDINI kanal potvrde (nema telefonskog fallbacka). */
export async function posaljiPotvrduKupcu(narudzba: NarudzbaZaEmail): Promise<void> {
  const resend = getResendKlijent();
  if (!resend) {
    console.error(
      `RESEND_API_KEY nije postavljen — potvrda za narudžbu ${narudzba.brojNarudzbe} NIJE poslana kupcu.`
    );
    return;
  }

  const nacinPlacanjaNaziv = NAZIVI_NACINA_PLACANJA[narudzba.nacinPlacanja];

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2A2521;">
      <h1 style="font-weight:400;font-size:22px;margin-bottom:8px;">Hvala na narudžbi, ${narudzba.kupac.imePrezime}!</h1>
      <p style="color:#6b6459;line-height:1.6;">
        Vaša narudžba pod brojem <strong>#${narudzba.brojNarudzbe}</strong> je potvrđena. Informacije
        o isporuci šaljemo na ovu istu email adresu čim paket bude spreman za slanje.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
        ${stavkeHtml(narudzba.stavke)}
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-weight:600;">Ukupno</td>
          <td style="padding:12px 0 0;font-weight:600;text-align:right;">${formatPrice(narudzba.ukupnaCijena)}</td>
        </tr>
      </table>
      <p style="color:#6b6459;line-height:1.6;font-size:14px;">
        <strong>Način plaćanja:</strong> ${nacinPlacanjaNaziv}<br>
        <strong>Dostava na:</strong> ${narudzba.kupac.adresa}, ${narudzba.kupac.grad}
      </p>
      <p style="color:#6b6459;line-height:1.6;font-size:13px;margin-top:32px;">
        Pitanja? Odgovorite direktno na ovaj email ili nam pišite na
        <a href="mailto:info@aurelia.ba" style="color:#8A6634;">info@aurelia.ba</a>.
      </p>
    </div>
  `;

  const text = `Hvala na narudžbi, ${narudzba.kupac.imePrezime}!

Vaša narudžba pod brojem #${narudzba.brojNarudzbe} je potvrđena. Informacije o isporuci šaljemo na ovu istu email adresu čim paket bude spreman za slanje.

${stavkeTekst(narudzba.stavke)}

Ukupno: ${formatPrice(narudzba.ukupnaCijena)}
Način plaćanja: ${nacinPlacanjaNaziv}
Dostava na: ${narudzba.kupac.adresa}, ${narudzba.kupac.grad}

Pitanja? Odgovorite direktno na ovaj email ili nam pišite na info@aurelia.ba.`;

  const { error } = await resend.emails.send({
    from: OD_ADRESA,
    to: narudzba.kupac.email,
    replyTo: VLASNIK_EMAIL,
    subject: `Potvrda narudžbe #${narudzba.brojNarudzbe} — Aurelia`,
    html,
    text,
  });

  if (error) {
    console.error(`Slanje potvrde kupcu za narudžbu ${narudzba.brojNarudzbe} nije uspjelo:`, error);
  }
}

/** Obavještenje vlasniku — jedini način da neko sazna za narudžbu dok ne postoji prava baza/admin. */
export async function posaljiObavjestenjeVlasniku(narudzba: NarudzbaZaEmail): Promise<void> {
  const resend = getResendKlijent();
  if (!resend) {
    console.error(
      `RESEND_API_KEY nije postavljen — obavještenje za narudžbu ${narudzba.brojNarudzbe} NIJE poslano vlasniku.`
    );
    return;
  }

  const nacinPlacanjaNaziv = NAZIVI_NACINA_PLACANJA[narudzba.nacinPlacanja];

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2A2521;">
      <h1 style="font-weight:400;font-size:22px;margin-bottom:8px;">Nova narudžba #${narudzba.brojNarudzbe}</h1>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
        ${stavkeHtml(narudzba.stavke)}
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-weight:600;">Ukupno</td>
          <td style="padding:12px 0 0;font-weight:600;text-align:right;">${formatPrice(narudzba.ukupnaCijena)}</td>
        </tr>
      </table>
      <p style="line-height:1.8;font-size:14px;">
        <strong>Kupac:</strong> ${narudzba.kupac.imePrezime}<br>
        <strong>Email:</strong> <a href="mailto:${narudzba.kupac.email}">${narudzba.kupac.email}</a><br>
        <strong>Telefon:</strong> <a href="tel:${narudzba.kupac.telefon.replace(/\s/g, "")}">${narudzba.kupac.telefon}</a><br>
        <strong>Adresa:</strong> ${narudzba.kupac.adresa}, ${narudzba.kupac.grad}<br>
        <strong>Način plaćanja:</strong> ${nacinPlacanjaNaziv}
        ${narudzba.kupac.napomena ? `<br><strong>Napomena:</strong> ${narudzba.kupac.napomena}` : ""}
      </p>
    </div>
  `;

  const text = `Nova narudžba #${narudzba.brojNarudzbe}

${stavkeTekst(narudzba.stavke)}

Ukupno: ${formatPrice(narudzba.ukupnaCijena)}

Kupac: ${narudzba.kupac.imePrezime}
Email: ${narudzba.kupac.email}
Telefon: ${narudzba.kupac.telefon}
Adresa: ${narudzba.kupac.adresa}, ${narudzba.kupac.grad}
Način plaćanja: ${nacinPlacanjaNaziv}${narudzba.kupac.napomena ? `\nNapomena: ${narudzba.kupac.napomena}` : ""}`;

  const { error } = await resend.emails.send({
    from: OD_ADRESA,
    to: VLASNIK_EMAIL,
    replyTo: narudzba.kupac.email,
    subject: `Nova narudžba #${narudzba.brojNarudzbe} — ${formatPrice(narudzba.ukupnaCijena)}`,
    html,
    text,
  });

  if (error) {
    console.error(
      `Slanje obavještenja vlasniku za narudžbu ${narudzba.brojNarudzbe} nije uspjelo:`,
      error
    );
  }
}
