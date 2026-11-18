import Script from "next/script";

// Google Tag Manager kontejner za Google Ads / GA4 (korisnik, 18.11.2026).
// Učitava se SAMO iz (prodavnica)/layout.tsx — /admin posjete ne ulaze u statistiku ni konverzije.
// Standardni GTM loader: push "gtm.js" eventa prije učitavanja skripte je potreban da bi
// "All Pages"/"Initialization" triggeri u GTM-u okinuli. gtag() je definisan za tagove koji ga koriste.
export const GTM_ID = "GTM-MNVDL6CQ";

export function GoogleTagManager() {
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`}
      </Script>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
