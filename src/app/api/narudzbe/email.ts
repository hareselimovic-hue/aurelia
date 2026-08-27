// Slanje mailova nakon narudžbe — vidi route.ts TODO (23.08.2026): email je JEDINI kanal potvrde
// obećan kupcu na checkout formi, i jedini način da vlasnik sazna za novu narudžbu (nema telefona).
// Provajder: Resend, domen aurelia.ba verifikovan (DKIM + SPF na send.aurelia.ba poddomenu).
//
// HTML je namjerno table-based sa isključivo inline stilovima (23.08.2026, korisnički zahtjev za
// ljepšim izgledom) — mail klijenti (pogotovo Outlook desktop) ignorišu <style> blokove i moderni
// CSS (flex/grid), pa je tabela jedini layout koji pouzdano izgleda isto svugdje. Iz istog razloga
// nema web fonta (Fraunces/DM Sans sa sajta) — Georgia/system-ui fallback je jedino što je garantovano
// dostupno bez učitavanja eksternog resursa koji većina klijenata blokira po defaultu.

import { Resend } from "resend";

import { formatPrice } from "@/lib/format";

import type { NacinPlacanja, NarudzbaKupac, NarudzbaStavka } from "./types";

const OD_ADRESA = "Aurelia <narudzbe@aurelia.ba>";
const VLASNIK_EMAIL = "info@aurelia.ba";

// Paleta preuzeta iz globals.css (--background, --foreground, --primary, --secondary, --accent) —
// isti brend izgled kao na sajtu, samo hex umjesto OKLCH (mail klijenti ne podržavaju oklch()).
const BOJA = {
  pozadinaStranice: "#F1EAE0",
  pozadinaKartice: "#FFFFFF",
  tamna: "#2A2521",
  bronza: "#8A6634",
  bronzaTamnija: "#6E4F26",
  tekst: "#2A2521",
  tekstMuted: "#7A7267",
  granica: "#EFE2C5",
  kutijaBg: "#FAF6F0",
};

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

type NarudzbaZaEmail = {
  brojNarudzbe: string;
  kupac: NarudzbaKupac;
  nacinPlacanja: NacinPlacanja;
  stavke: NarudzbaStavka[];
  // `ukupnaCijena` ovdje je već KONAČAN iznos (stavke + dostava, izračunato u route.ts) — dostava
  // se prosljeđuje odvojeno samo da se prikaže kao svoj red u tabeli/tekstu maila.
  cijenaDostave: number;
  ukupnaCijena: number;
};

function stavkeHtmlRedovi(stavke: NarudzbaStavka[]): string {
  return stavke
    .map(
      (s, i) => `
      <tr>
        <td style="padding:14px 0;border-top:${i === 0 ? "none" : `1px solid ${BOJA.granica}`};font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${BOJA.tekst};">
          ${s.naziv}${s.dimenzija ? `<br><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BOJA.tekstMuted};">${s.dimenzija}</span>` : ""}
        </td>
        <td align="center" style="padding:14px 0;border-top:${i === 0 ? "none" : `1px solid ${BOJA.granica}`};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BOJA.tekstMuted};white-space:nowrap;">
          ${s.kolicina}×
        </td>
        <td align="right" style="padding:14px 0;border-top:${i === 0 ? "none" : `1px solid ${BOJA.granica}`};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BOJA.tekst};white-space:nowrap;">
          ${formatPrice(s.cijenaPoKomadu * s.kolicina)}
        </td>
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

function stavkeTabela(stavke: NarudzbaStavka[], cijenaDostave: number, ukupnaCijena: number): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${stavkeHtmlRedovi(stavke)}
      <tr>
        <td colspan="2" style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BOJA.tekstMuted};">
          Dostava
        </td>
        <td align="right" style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BOJA.tekst};white-space:nowrap;">
          ${cijenaDostave === 0 ? "Besplatno" : formatPrice(cijenaDostave)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:16px 0 0;border-top:2px solid ${BOJA.bronza};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${BOJA.tekst};">
          Ukupno
        </td>
        <td align="right" style="padding:16px 0 0;border-top:2px solid ${BOJA.bronza};font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:${BOJA.bronzaTamnija};white-space:nowrap;">
          ${formatPrice(ukupnaCijena)}
        </td>
      </tr>
    </table>`;
}

/** Sivo-bijela info kutija (bg kutijaBg) sa label/vrijednost redovima — koristi se za dostavu i za podatke kupca. */
function infoKutija(redovi: { label: string; vrijednost: string }[]): string {
  const stavkeHtml = redovi
    .map(
      (r) => `
      <tr>
        <td style="padding:4px 12px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BOJA.tekstMuted};white-space:nowrap;vertical-align:top;">
          ${r.label}
        </td>
        <td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BOJA.tekst};">
          ${r.vrijednost}
        </td>
      </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:${BOJA.kutijaBg};border-radius:8px;">
      <tr>
        <td style="padding:18px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${stavkeHtml}
          </table>
        </td>
      </tr>
    </table>`;
}

/**
 * Zajednička ljuska (header sa wordmarkom + footer) za oba tipa maila. Tekstualni "AURELIA" wordmark
 * umjesto <img> loga — mail klijenti po defaultu blokiraju slike dok korisnik ne klikne "prikaži
 * slike", pa bi header inače bio prazan pri prvom otvaranju.
 */
function emailShell(opts: { pretpregled: string; naslov: string; sadrzaj: string }): string {
  return `<!DOCTYPE html>
<html lang="bs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${opts.naslov}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BOJA.pozadinaStranice};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
      ${opts.pretpregled}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BOJA.pozadinaStranice};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BOJA.pozadinaKartice};border-radius:12px;overflow:hidden;">
            <tr>
              <td align="center" style="background-color:${BOJA.tamna};padding:28px 24px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:4px;color:${BOJA.bronza};">AURELIA</span>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B8AFA0;margin-top:6px;">
                  Premium posteljina
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                ${opts.sadrzaj}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid ${BOJA.granica};">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${BOJA.tekstMuted};">
                  Aurelia · TB d.o.o. · Derviša Numića 4, Bosna i Hercegovina<br />
                  <a href="mailto:info@aurelia.ba" style="color:${BOJA.bronza};text-decoration:none;">info@aurelia.ba</a>
                  &nbsp;·&nbsp;
                  <a href="https://aurelia.ba/" style="color:${BOJA.bronza};text-decoration:none;">aurelia.ba</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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

  const sadrzaj = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:4px 12px;background-color:${BOJA.granica};color:${BOJA.bronzaTamnija};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.5px;border-radius:20px;">
            NARUDŽBA #${narudzba.brojNarudzbe}
          </span>
        </td>
      </tr>
    </table>
    <h1 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;color:${BOJA.tekst};">
      Hvala na narudžbi, ${narudzba.kupac.imePrezime}!
    </h1>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${BOJA.tekstMuted};">
      Narudžba je potvrđena. Informacije o isporuci šaljemo na ovu istu email adresu čim paket bude spreman za slanje.
    </p>
    ${stavkeTabela(narudzba.stavke, narudzba.cijenaDostave, narudzba.ukupnaCijena)}
    <div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>
    ${infoKutija([
      { label: "Plaćanje", vrijednost: nacinPlacanjaNaziv },
      {
        label: "Dostava na",
        vrijednost: `${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}`,
      },
    ])}
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${BOJA.tekstMuted};">
      Pitanja o narudžbi? Samo odgovorite direktno na ovaj email.
    </p>
  `;

  const html = emailShell({
    pretpregled: `Narudžba #${narudzba.brojNarudzbe} je potvrđena — ${formatPrice(narudzba.ukupnaCijena)}`,
    naslov: `Potvrda narudžbe #${narudzba.brojNarudzbe}`,
    sadrzaj,
  });

  const text = `Hvala na narudžbi, ${narudzba.kupac.imePrezime}!

Vaša narudžba pod brojem #${narudzba.brojNarudzbe} je potvrđena. Informacije o isporuci šaljemo na ovu istu email adresu čim paket bude spreman za slanje.

${stavkeTekst(narudzba.stavke)}

Dostava: ${narudzba.cijenaDostave === 0 ? "Besplatno" : formatPrice(narudzba.cijenaDostave)}
Ukupno: ${formatPrice(narudzba.ukupnaCijena)}
Način plaćanja: ${nacinPlacanjaNaziv}
Dostava na: ${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}

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

  const sadrzaj = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:4px 12px;background-color:${BOJA.bronza};color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.5px;border-radius:20px;">
            NOVA NARUDŽBA
          </span>
        </td>
      </tr>
    </table>
    <h1 style="margin:16px 0 24px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;color:${BOJA.tekst};">
      #${narudzba.brojNarudzbe} — ${formatPrice(narudzba.ukupnaCijena)}
    </h1>
    ${stavkeTabela(narudzba.stavke, narudzba.cijenaDostave, narudzba.ukupnaCijena)}
    <div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>
    ${infoKutija([
      { label: "Kupac", vrijednost: narudzba.kupac.imePrezime },
      {
        label: "Email",
        vrijednost: `<a href="mailto:${narudzba.kupac.email}" style="color:${BOJA.bronzaTamnija};">${narudzba.kupac.email}</a>`,
      },
      {
        label: "Telefon",
        vrijednost: `<a href="tel:${narudzba.kupac.telefon.replace(/\s/g, "")}" style="color:${BOJA.bronzaTamnija};">${narudzba.kupac.telefon}</a>`,
      },
      {
        label: "Adresa",
        vrijednost: `${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}`,
      },
      { label: "Plaćanje", vrijednost: nacinPlacanjaNaziv },
      ...(narudzba.kupac.napomena
        ? [{ label: "Napomena", vrijednost: narudzba.kupac.napomena }]
        : []),
    ])}
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${BOJA.tekstMuted};">
      Odgovorite direktno na ovaj email da kontaktirate kupca.
    </p>
  `;

  const html = emailShell({
    pretpregled: `Nova narudžba #${narudzba.brojNarudzbe} — ${formatPrice(narudzba.ukupnaCijena)} od ${narudzba.kupac.imePrezime}`,
    naslov: `Nova narudžba #${narudzba.brojNarudzbe}`,
    sadrzaj,
  });

  const text = `Nova narudžba #${narudzba.brojNarudzbe}

${stavkeTekst(narudzba.stavke)}

Dostava: ${narudzba.cijenaDostave === 0 ? "Besplatno" : formatPrice(narudzba.cijenaDostave)}
Ukupno: ${formatPrice(narudzba.ukupnaCijena)}

Kupac: ${narudzba.kupac.imePrezime}
Email: ${narudzba.kupac.email}
Telefon: ${narudzba.kupac.telefon}
Adresa: ${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}
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

/** "Paket poslan" — okida se ručno iz /admin/narudzbe kad vlasnik označi narudžbu kao poslanu. */
export async function posaljiObavjestenjePoslano(
  narudzba: Pick<NarudzbaZaEmail, "brojNarudzbe" | "kupac">
): Promise<void> {
  const resend = getResendKlijent();
  if (!resend) {
    console.error(
      `RESEND_API_KEY nije postavljen — obavještenje o slanju za narudžbu ${narudzba.brojNarudzbe} NIJE poslano.`
    );
    return;
  }

  const sadrzaj = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:4px 12px;background-color:${BOJA.granica};color:${BOJA.bronzaTamnija};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.5px;border-radius:20px;">
            NARUDŽBA #${narudzba.brojNarudzbe}
          </span>
        </td>
      </tr>
    </table>
    <h1 style="margin:16px 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;color:${BOJA.tekst};">
      Vaš paket je poslan!
    </h1>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${BOJA.tekstMuted};">
      Narudžba #${narudzba.brojNarudzbe} je na putu do vas, na adresu: ${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}.
    </p>
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${BOJA.tekstMuted};">
      Pitanja o dostavi? Samo odgovorite direktno na ovaj email.
    </p>
  `;

  const html = emailShell({
    pretpregled: `Narudžba #${narudzba.brojNarudzbe} je poslana i na putu je do vas`,
    naslov: `Vaš paket je poslan — #${narudzba.brojNarudzbe}`,
    sadrzaj,
  });

  const text = `Vaš paket je poslan!

Narudžba #${narudzba.brojNarudzbe} je na putu do vas, na adresu: ${narudzba.kupac.adresa}, ${narudzba.kupac.postanskiBroj} ${narudzba.kupac.grad}.

Pitanja o dostavi? Samo odgovorite direktno na ovaj email.`;

  const { error } = await resend.emails.send({
    from: OD_ADRESA,
    to: narudzba.kupac.email,
    replyTo: VLASNIK_EMAIL,
    subject: `Vaš paket je poslan — narudžba #${narudzba.brojNarudzbe}`,
    html,
    text,
  });

  if (error) {
    console.error(
      `Slanje obavještenja o slanju za narudžbu ${narudzba.brojNarudzbe} nije uspjelo:`,
      error
    );
  }
}
