import type { Metadata } from "next";
import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";
import { EmbedAutoResize } from "@/components/embed/EmbedAutoResize";

// Widget NU (sans header/footer) destiné à être intégré en iframe sur
// sinvestir.fr. Voir le snippet d'intégration dans le README.
export const metadata: Metadata = {
  title: "Simulateur crypto — embed",
  robots: { index: false, follow: false },
};

export default function EmbedCryptoPage() {
  return (
    <main className="p-3 sm:p-4">
      <EmbedAutoResize />
      <CryptoSimulator embed />
      <p className="mt-3 text-center text-[11px] text-muted/70">
        Propulsé par{" "}
        <a
          href="https://simulateurs.sinvestir.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline"
        >
          S&apos;investir Simulateurs
        </a>
      </p>
    </main>
  );
}
