"use server";

import { revalidatePath } from "next/cache";

import { posaljiObavjestenjePoslano } from "@/app/api/narudzbe/email";
import type { NarudzbaStavka } from "@/app/api/narudzbe/types";
import { prisma } from "@/lib/prisma";
import { izracunajSkidanjeZalihe } from "@/lib/zaliha";

// Zaštita ove akcije dolazi iz middleware-a (src/middleware.ts pokriva cijeli /admin prefiks) —
// server action se poziva POST-om na /admin/narudzbe/ stranicu, koja je već iza sesijske provjere.
export async function oznaciPoslano(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  // Zaštita od dvostrukog skidanja zalihe (npr. dupli klik/submit) — ako je narudžba već poslana,
  // ne radi ništa (korisnik, 10.10.2026: zaliha se skida tačno jednom po narudžbi).
  const postojeca = await prisma.narudzba.findUnique({ where: { id } });
  if (!postojeca || postojeca.status === "poslano") return;

  const narudzba = await prisma.$transaction(async (tx) => {
    const azurirana = await tx.narudzba.update({
      where: { id },
      data: { status: "poslano", poslanoAt: new Date() },
    });

    // Zaliha (korisnik, 10.10.2026): automatsko skidanje po stavkama narudžbe, "puni set"
    // proizvodi se razlažu na stvarne komponente (src/lib/zaliha.ts). `upsert` umjesto `update`
    // jer red u Zaliha možda ne postoji ako vlasnik nikad nije ručno unio početno stanje za taj
    // artikal — tad kreće od 0 i ide u minus, što je namjerno (signal, ne blokada).
    const stavke = azurirana.stavke as unknown as NarudzbaStavka[];
    const skidanje = izracunajSkidanjeZalihe(stavke);
    for (const [slug, kolicina] of skidanje) {
      await tx.zaliha.upsert({
        where: { slug },
        create: { slug, kolicina: -kolicina },
        update: { kolicina: { decrement: kolicina } },
      });
    }

    return azurirana;
  });

  await posaljiObavjestenjePoslano({
    brojNarudzbe: narudzba.brojNarudzbe,
    kupac: {
      imePrezime: narudzba.imePrezime,
      email: narudzba.email,
      telefon: narudzba.telefon,
      adresa: narudzba.adresa,
      grad: narudzba.grad,
      postanskiBroj: narudzba.postanskiBroj,
      napomena: narudzba.napomena ?? undefined,
    },
  });

  revalidatePath("/admin/narudzbe");
  revalidatePath("/admin/zaliha");
}
