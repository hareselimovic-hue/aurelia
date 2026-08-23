import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Header/Footer žive ovdje (ne u root layout.tsx) — route group izdvaja sve javne/kupovne stranice
// od /admin (interni alat, bez sajt navigacije/pretrage/korpe). Ključno: root layout ostaje bez
// headers()/cookies() poziva, pa statične stranice (početna, proizvodi) i dalje mogu biti
// prerenderovane u build-u umjesto da postanu dinamičke za CIJEL sajt samo zbog admin izuzetka.
export default function ProdavnicaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
