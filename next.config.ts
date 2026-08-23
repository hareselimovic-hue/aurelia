import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE_aurelia.md §2: "trailing slash konzistentno kroz cijeli sajt" — svi interni linkovi
  // (nav, breadcrumb, canonical) već koriste trailing slash, pa Next.js mora i generisati/zahtijevati isto.
  trailingSlash: true,
  // "standalone" izlaz — samodovoljan build (minimalan node_modules + server.js) namijenjen
  // pokretanju na pravom Node.js serveru (cPanel "Setup Node.js App" / Passenger, isto tako i
  // Railway/Docker). Bez ovoga bi trebao pun `next start` sa cijelim dev node_modules na serveru.
  //
  // NAMJERNO uslovno: Vercel ima SOPSTVENI build/deploy mehanizam koji ne očekuje standalone izlaz
  // — kad je output:"standalone" postavljen, Vercel-ov "onBuildComplete" korak puca sa
  // "ENOENT .next/next-server.js.nft.json" (23.08.2026, prvi deployment pokušaj). `process.env.VERCEL`
  // je uvijek "1" tokom Vercel builda, pa se standalone primjenjuje samo van Vercela (cPanel/Docker).
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
