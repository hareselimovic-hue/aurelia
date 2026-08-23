// Autentifikacija za /admin/narudzbe — namjerno jednostavna (jedna dijeljena lozinka, ne pravi
// korisnički nalozi) jer je ovo jednovlasnička prodavnica bez tima koji bi trebao odvojene naloge.
// HMAC-potpisan kolačić umjesto sesijske tabele u bazi — nema šta da se čuva/čisti, i radi identično
// u middleware-u (Edge runtime) i API rutama (Node runtime) jer koristi Web Crypto (crypto.subtle),
// ne Node-only "crypto" modul koji Edge runtime nema.

export const KOLACIC_IME = "aurelia_admin_sesija";
const TRAJANJE_MS = 1000 * 60 * 60 * 24 * 30; // 30 dana

async function hmacKljuc(): Promise<CryptoKey> {
  const tajna = process.env.SESSION_SECRET;
  if (!tajna) {
    throw new Error("SESSION_SECRET nije postavljen — admin login ne može raditi bez njega.");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(tajna),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bajtoviUHex(bajtovi: ArrayBuffer): string {
  return Array.from(new Uint8Array(bajtovi))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function napraviSesijskiKolacic(): Promise<string> {
  const istice = Date.now() + TRAJANJE_MS;
  const kljuc = await hmacKljuc();
  const potpis = await crypto.subtle.sign("HMAC", kljuc, new TextEncoder().encode(String(istice)));
  return `${istice}.${bajtoviUHex(potpis)}`;
}

export async function jeSesijaValidna(vrijednostKolacica: string | undefined): Promise<boolean> {
  if (!vrijednostKolacica) return false;
  const [isticeStr, potpisHex] = vrijednostKolacica.split(".");
  if (!isticeStr || !potpisHex) return false;

  const istice = Number(isticeStr);
  if (!Number.isFinite(istice) || istice < Date.now()) return false;

  const kljuc = await hmacKljuc();
  const ocekivaniPotpis = await crypto.subtle.sign(
    "HMAC",
    kljuc,
    new TextEncoder().encode(isticeStr)
  );
  return bajtoviUHex(ocekivaniPotpis) === potpisHex;
}
