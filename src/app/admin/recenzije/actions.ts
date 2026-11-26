"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// Zaštita: middleware (src/middleware.ts) pokriva cijeli /admin prefiks.
// Odobravanje/skrivanje recenzije odmah osvježava stranicu proizvoda (ISR, revalidate 600).
export async function postaviStatusRecenzije(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || (status !== "odobreno" && status !== "odbijeno")) return;

  const recenzija = await prisma.recenzija.update({ where: { id }, data: { status } });

  revalidatePath(`/shop/${recenzija.slug}/`);
  revalidatePath("/admin/recenzije");
}
