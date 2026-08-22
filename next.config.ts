import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE_aurelia.md §2: "trailing slash konzistentno kroz cijeli sajt" — svi interni linkovi
  // (nav, breadcrumb, canonical) već koriste trailing slash, pa Next.js mora i generisati/zahtijevati isto.
  trailingSlash: true,
};

export default nextConfig;
