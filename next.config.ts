import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE_aurelia.md §2: "trailing slash konzistentno kroz cijeli sajt" — svi interni linkovi
  // (nav, breadcrumb, canonical) već koriste trailing slash, pa Next.js mora i generisati/zahtijevati isto.
  trailingSlash: true,
  // "standalone" izlaz — samodovoljan build (minimalan node_modules + server.js) namijenjen
  // pokretanju na pravom Node.js serveru (cPanel "Setup Node.js App" / Passenger, isto tako i
  // Railway/Docker). Bez ovoga bi trebao pun `next start` sa cijelim dev node_modules na serveru.
  output: "standalone",
};

export default nextConfig;
