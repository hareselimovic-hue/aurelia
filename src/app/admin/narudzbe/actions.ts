"use server";

import { revalidatePath } from "next/cache";

import { posaljiObavjestenjePoslano } from "@/app/api/narudzbe/email";
import { prisma } from "@/lib/prisma";

// Zaštita ove akcije dolazi iz middleware-a (src/middleware.ts pokriva cijeli /admin prefiks) —
// server action se poziva POST-om na /admin/narudzbe/ stranicu, koja je već iza sesijske provjere.
export async function oznaciPoslano(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const narudzba = await prisma.narudzba.update({
    where: { id },
    data: { status: "poslano", poslanoAt: new Date() },
  });

  await posaljiObavjestenjePoslano({
    brojNarudzbe: narudzba.brojNarudzbe,
    kupac: {
      imePrezime: narudzba.imePrezime,
      email: narudzba.email,
      telefon: narudzba.telefon,
      adresa: narudzba.adresa,
      grad: narudzba.grad,
      napomena: narudzba.napomena ?? undefined,
    },
  });

  revalidatePath("/admin/narudzbe");
}
