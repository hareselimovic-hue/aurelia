"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// Zaštita dolazi iz middleware-a (src/middleware.ts pokriva cijeli /admin prefiks), isti obrazac
// kao oznaciPoslano u src/app/admin/narudzbe/actions.ts.
export async function azurirajZalihu(formData: FormData) {
  const slug = formData.get("slug");
  const kolicinaRaw = formData.get("kolicina");

  if (typeof slug !== "string" || !slug) return;
  const kolicina = Number(kolicinaRaw);
  if (!Number.isInteger(kolicina)) return;

  await prisma.zaliha.upsert({
    where: { slug },
    create: { slug, kolicina },
    update: { kolicina },
  });

  revalidatePath("/admin/zaliha");
}
