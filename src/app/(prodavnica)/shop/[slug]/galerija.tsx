"use client";

// Galerija proizvodne stranice (src/app/shop/[slug]/page.tsx) — mreža slika ostaje ista kao prije,
// ali klik na sliku otvara prikaz preko cijelog ekrana (korisnik, 07.11.2026: "ne otvara sliku kad
// kliknem"). Strelice/tastatura (← →, Esc) i swipe na telefonu za listanje. Placeholder slike se
// ne otvaraju — nema šta uvećati.

import { useState, useRef } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { PlaceholderImage } from "@/components/placeholder-image";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/products";

type Slika = { url: string; alt: string };

export function Galerija({ slike }: { slike: Slika[] }) {
  const prave = slike.filter((s) => s.url !== PLACEHOLDER_IMAGE);
  const [otvorena, setOtvorena] = useState<number | null>(null);
  const dodirX = useRef<number | null>(null);

  const pomjeri = (korak: number) =>
    setOtvorena((i) => (i === null ? i : (i + korak + prave.length) % prave.length));

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {slike.map((slika, i) => (
          <div
            key={`${slika.url}-${i}`}
            className={cn(
              "relative aspect-[3/4] overflow-hidden rounded-lg bg-muted",
              i === 0 && "col-span-2"
            )}
          >
            {slika.url === PLACEHOLDER_IMAGE ? (
              <PlaceholderImage alt={slika.alt} />
            ) : (
              <button
                type="button"
                onClick={() => setOtvorena(prave.indexOf(slika))}
                className="block h-full w-full cursor-zoom-in"
                aria-label={`Uvećaj sliku: ${slika.alt}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- lokalne slike, bez next/image domain configa */}
                <img
                  src={slika.url}
                  alt={slika.alt}
                  loading={i === 0 ? undefined : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </button>
            )}
          </div>
        ))}
      </div>

      <DialogPrimitive.Root
        open={otvorena !== null}
        onOpenChange={(open) => !open && setOtvorena(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/90" />
          <DialogPrimitive.Popup
            className="fixed inset-0 z-50 flex items-center justify-center outline-none"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") pomjeri(-1);
              if (e.key === "ArrowRight") pomjeri(1);
            }}
            onTouchStart={(e) => (dodirX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (dodirX.current === null) return;
              const razlika = e.changedTouches[0].clientX - dodirX.current;
              if (Math.abs(razlika) > 50) pomjeri(razlika < 0 ? 1 : -1);
              dodirX.current = null;
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              {otvorena !== null ? prave[otvorena]?.alt : ""}
            </DialogPrimitive.Title>

            {otvorena !== null && prave[otvorena] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prave[otvorena].url}
                alt={prave[otvorena].alt}
                className="max-h-[90vh] max-w-[94vw] rounded-md object-contain"
              />
            )}

            <DialogPrimitive.Close
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Zatvori"
            >
              <XIcon className="size-6" />
            </DialogPrimitive.Close>

            {prave.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => pomjeri(-1)}
                  className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
                  aria-label="Prethodna slika"
                >
                  <ChevronLeftIcon className="size-7" />
                </button>
                <button
                  type="button"
                  onClick={() => pomjeri(1)}
                  className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
                  aria-label="Sljedeća slika"
                >
                  <ChevronRightIcon className="size-7" />
                </button>
                <p className="absolute bottom-4 text-sm text-white/80">
                  {(otvorena ?? 0) + 1} / {prave.length}
                </p>
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
