import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/8">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Simulateur pédagogique de plus-value crypto. Les performances
              passées ne préjugent en rien des performances futures. Ceci n&apos;est
              pas un conseil en investissement.
            </p>
          </div>
          <div className="text-xs text-muted">
            <p className="mb-2 font-semibold text-white/80">Données</p>
            <p>Historique : Binance (hebdomadaire, EUR)</p>
            <p>Catalogue &amp; prix : CoinGecko</p>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-muted/70">
          Démo réalisée pour le test technique S&apos;investir — habillage repris de
          simulateurs.sinvestir.fr.
        </p>
      </div>
    </footer>
  );
}
