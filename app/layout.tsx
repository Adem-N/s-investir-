import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simulateur-crypto-sinvestir.vercel.app"),
  title: "Simulateur de plus-value crypto | S'investir",
  description:
    "Simulez la performance passée d'un investissement crypto (en une seule fois ou en DCA) sur des données historiques réelles. Outil gratuit et pédagogique.",
  // Favicon = mark officiel S'investir. On le déclare via `icons` (assets
  // statiques de /public) plutôt que par la convention app/icon.svg, car un
  // chemin de projet contenant une apostrophe casse le metadata-route-loader.
  icons: {
    icon: "/brand/sinvestir-mark-gold.svg",
    shortcut: "/brand/sinvestir-mark-gold.svg",
    apple: "/brand/sinvestir-mark-gold.svg",
  },
  openGraph: {
    title: "Simulateur de plus-value crypto | S'investir",
    description:
      "Combien aurait rapporté votre investissement crypto ? Backtest sur données réelles, en une fois ou en DCA.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={lexend.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
