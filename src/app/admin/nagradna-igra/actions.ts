"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";

import { NAGRADNA_IGRA } from "@/lib/nagradna-igra";
import { prisma } from "@/lib/prisma";

// Zaštita: middleware (src/middleware.ts) pokriva cijeli /admin prefiks, isto kao zaliha/actions.ts.
// Nasumično (crypto.randomInt) bira jednu još neizvučenu prijavu — ponovni klik = rezervni dobitnik
// (ako prvi ne prati profil ili se ne javi u 5 dana, pravila tačka 6).
export async function izvuciDobitnika() {
  const kandidati = await prisma.nagradnaPrijava.findMany({
    where: { igra: NAGRADNA_IGRA.kljuc, izvucenAt: null },
    select: { id: true },
  });
  if (kandidati.length === 0) return;

  const izabran = kandidati[randomInt(kandidati.length)];
  await prisma.nagradnaPrijava.update({
    where: { id: izabran.id },
    data: { izvucenAt: new Date() },
  });

  revalidatePath("/admin/nagradna-igra");
}
