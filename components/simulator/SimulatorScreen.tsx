import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CryptoSimulator } from "./CryptoSimulator";

export function SimulatorScreen() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-10 sm:px-6 sm:pt-12">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gain" />
            Backtest sur données historiques réelles
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-[42px] sm:leading-[1.1]">
            Simulateur de <span className="text-brand">plus-value crypto</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Découvrez ce qu&apos;aurait rapporté un investissement — en une seule fois
            ou progressif (DCA) — sur la performance passée des principales
            cryptomonnaies.
          </p>
        </div>

        <CryptoSimulator />
      </main>
      <Footer />
    </div>
  );
}
