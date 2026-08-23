"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [lozinka, setLozinka] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [ucitava, setUcitava] = useState(false);

  async function posaljiFormu(e: React.FormEvent) {
    e.preventDefault();
    setGreska(null);
    setUcitava(true);
    try {
      const odgovor = await fetch("/api/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lozinka }),
      });
      const podaci = await odgovor.json();
      if (!odgovor.ok || !podaci.ok) {
        setGreska(podaci.greska ?? "Prijava nije uspjela.");
        setUcitava(false);
        return;
      }
      router.push("/admin/narudzbe/");
      router.refresh();
    } catch {
      setGreska("Greška u komunikaciji sa serverom.");
      setUcitava(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 ring-1 ring-border">
        <p className="font-heading text-lg font-medium text-foreground">Aurelia — admin</p>
        <form onSubmit={posaljiFormu} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lozinka">Lozinka</Label>
            <Input
              id="lozinka"
              type="password"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
              autoFocus
              required
            />
          </div>
          {greska && <p className="text-sm text-destructive">{greska}</p>}
          <Button type="submit" className="w-full" disabled={ucitava}>
            {ucitava ? "Prijava…" : "Prijavi se"}
          </Button>
        </form>
      </div>
    </main>
  );
}
