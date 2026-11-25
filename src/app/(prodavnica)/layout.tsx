import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { PopustPopup } from "@/components/popust-popup";

// Header/Footer žive ovdje (ne u root layout.tsx) — route group izdvaja sve javne/kupovne stranice
// od /admin (interni alat, bez sajt navigacije/pretrage/korpe). Ključno: root layout ostaje bez
// headers()/cookies() poziva, pa statične stranice (početna, proizvodi) i dalje mogu biti
// prerenderovane u build-u umjesto da postanu dinamičke za CIJEL sajt samo zbog admin izuzetka.
export default function ProdavnicaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleTagManager />
      <MetaPixel />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PopustPopup />
    </>
  );
}
