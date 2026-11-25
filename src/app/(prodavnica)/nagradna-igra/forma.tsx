"use client";

// Forma za prijavu u nagradnu igru — šalje na /api/nagradna-igra (server radi svu stvarnu
// validaciju i provjeru datuma; ovo je samo za brzu povratnu informaciju).

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pratiMeta } from "@/lib/meta-pixel";
import type { NagradnaPrijavaOdgovor } from "@/app/api/narudzbe/types";

export function NagradnaForma({
  instagramUrl,
  instagramProfil,
}: {
  instagramUrl: string;
  instagramProfil: string;
}) {
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pravila, setPravila] = useState(false);
  const [saljem, setSaljem] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [rezultat, setRezultat] = useState<{ dobioKod: boolean } | null>(null);

  async function posalji(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGreska("Unesite ispravnu email adresu.");
      return;
    }
    if (!instagram.trim()) {
      setGreska("Unesite svoje Instagram korisničko ime.");
      return;
    }
    if (!pravila) {
      setGreska("Za učešće je potrebno prihvatiti pravila nagradne igre.");
      return;
    }
    setGreska(null);
    setSaljem(true);
    try {
      const odgovor = await fetch("/api/nagradna-igra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          instagram,
          prihvatamPravila: pravila,
        }),
      });
      const r = (await odgovor.json()) as NagradnaPrijavaOdgovor;
      if (r.ok) {
        pratiMeta("Lead", { content_name: "nagradna-igra" });
        setRezultat({ dobioKod: r.dobioKod });
      }
      else setGreska(r.greska);
    } catch {
      setGreska("Slanje nije uspjelo. Pokušajte ponovo.");
    } finally {
      setSaljem(false);
    }
  }

  if (rezultat) {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-card p-6 text-center"
      >
        <p className="font-heading text-2xl text-foreground">
          Prijavljeni ste — sretno!
        </p>
        <p className="mt-3 text-muted-foreground">
          {rezultat.dobioKod
            ? "Na vaš email smo poslali potvrdu i lični kod za 10% popusta koji možete iskoristiti odmah."
            : "Na vaš email smo poslali potvrdu prijave."}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Ne zaboravite zapratiti{" "}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            @{instagramProfil}
          </a>{" "}
          — to je uslov za nagradu.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={posalji}
      noValidate
      className="space-y-4 rounded-xl border border-border bg-card p-6"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ni-email">Email *</Label>
        <Input
          id="ni-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ni-instagram">Instagram korisničko ime *</Label>
        <Input
          id="ni-instagram"
          placeholder="@vase.ime"
          autoComplete="off"
          autoCapitalize="none"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="h-11"
        />
        <p className="text-sm text-muted-foreground">
          Po ovome provjeravamo da li pratite naš profil.
        </p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={pravila}
          onChange={(e) => setPravila(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          Prihvatam{" "}
          <a
            href="#pravila"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            pravila nagradne igre
          </a>{" "}
          i saglasan/na sam da mi Aurelia povremeno šalje ponude na email.
        </span>
      </label>
      {greska && (
        <p role="alert" className="text-sm text-destructive">
          {greska}
        </p>
      )}
      <Button
        type="submit"
        variant="cta"
        disabled={saljem}
        className="h-11 w-full"
      >
        {saljem ? "Šaljemo…" : "Prijavi se u nagradnu igru"}
      </Button>
    </form>
  );
}
