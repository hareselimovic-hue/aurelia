"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function OdjaviSeDugme() {
  const router = useRouter();

  async function odjaviSe() {
    await fetch("/api/admin/logout/", { method: "POST" });
    router.push("/admin/login/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={odjaviSe}>
      Odjavi se
    </Button>
  );
}
