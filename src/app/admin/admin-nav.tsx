import Link from "next/link";

import { cn } from "@/lib/utils";

// Dijeljeni tab nav između admin stranica (korisnik, 10.10.2026 — dodana /admin/zaliha/ uz
// postojeću /admin/narudzbe/). Server komponenta (nema potrebe za client state) — aktivna
// stranica se prosljeđuje kao prop umjesto usePathname, isti obrazac kao hrefZaFilter u
// narudzbe/page.tsx (eksplicitno, ne magija).
const TABOVI = [
  { kljuc: "narudzbe", naziv: "Narudžbe", href: "/admin/narudzbe/" },
  { kljuc: "zaliha", naziv: "Zaliha", href: "/admin/zaliha/" },
] as const;

export function AdminNav({ aktivno }: { aktivno: "narudzbe" | "zaliha" }) {
  return (
    <nav className="flex gap-1 border-b border-border">
      {TABOVI.map((tab) => (
        <Link
          key={tab.kljuc}
          href={tab.href}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            tab.kljuc === aktivno
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.naziv}
        </Link>
      ))}
    </nav>
  );
}
