import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Privremeni CSS/DOM placeholder za fotografije proizvoda dok stvarne ne stignu (vidi
 * docs/product-data-raw.md — "Nedostaju fotografije proizvoda"). Renderuje se umjesto `<img>` kad
 * `slika.url === PLACEHOLDER_IMAGE` (src/lib/products.ts).
 *
 * `alt` se i dalje generiše iz atributa proizvoda (isti tekst koji bi išao na `<img alt=...>`) i
 * prosljeđuje ovdje kao `aria-label` na `role="img"` — kad prave fotografije stignu, isti alt tekst
 * ide direktno na `<img>`, bez izmjene modela podataka ili pozivnog koda.
 */
export function PlaceholderImage({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground",
        className
      )}
    >
      <ImageIcon className="size-6 shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium">Fotografija uskoro</span>
    </div>
  );
}
