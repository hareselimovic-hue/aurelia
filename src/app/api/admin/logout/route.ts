import { NextResponse } from "next/server";

import { KOLACIC_IME } from "@/lib/admin-sesija";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(KOLACIC_IME);
  return response;
}
