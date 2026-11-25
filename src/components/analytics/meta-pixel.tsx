"use client";

// Meta Pixel bazni kod (korisnik, 25.11.2026). Učitava se samo iz (prodavnica)/layout.tsx, isto kao
// GTM — /admin posjete ne ulaze u statistiku. Prvi PageView šalje init skripta; Next.js navigacija
// između stranica ne učitava stranicu ponovo, pa se PageView za svaku sljedeću rutu šalje ručno.

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { META_PIXEL_ID, pratiMeta } from "@/lib/meta-pixel";

/** Šalje jedan Meta događaj kad se komponenta prikaže (za server stranice, npr. ViewContent). */
export function MetaDogadjaj({
  dogadjaj,
  parametri,
}: {
  dogadjaj: string;
  parametri?: Record<string, unknown>;
}) {
  const poslano = useRef(false);
  useEffect(() => {
    if (poslano.current) return;
    poslano.current = true;
    pratiMeta(dogadjaj, parametri);
  }, [dogadjaj, parametri]);
  return null;
}

export function MetaPixel() {
  const putanja = usePathname();
  const prvaPutanja = useRef<string | null>(null);

  useEffect(() => {
    if (prvaPutanja.current === null) {
      prvaPutanja.current = putanja;
      return;
    }
    pratiMeta("PageView");
  }, [putanja]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- standardni Meta noscript piksel */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
