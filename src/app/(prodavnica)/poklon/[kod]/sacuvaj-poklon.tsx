"use client";

import { useEffect } from "react";

import { PROMO_STORAGE_KLJUC } from "@/components/popust-popup";
import { MOJ_KOD_KLJUC } from "@/components/preporuka-kutija";

/** Zapamti kod preporuke za checkout (osim ako je to kupčev vlastiti kod na istom uređaju). */
export function SacuvajPoklon({ kod }: { kod: string }) {
  useEffect(() => {
    try {
      if (localStorage.getItem(MOJ_KOD_KLJUC) === kod) return;
      localStorage.setItem(PROMO_STORAGE_KLJUC, kod);
      localStorage.setItem("aurelia-popup", "prijavljen");
    } catch {
      // storage nedostupan — kod se i dalje prenosi preko ?promo= u dugmetu
    }
  }, [kod]);
  return null;
}
