export function Disclaimer() {
  return (
    <div className="rounded-xl border border-gold/20 bg-gold/[0.04] px-4 py-3">
      <p className="text-[11px] leading-relaxed text-muted">
        <span className="font-semibold text-gold/90">Avertissement.</span> Les
        crypto-actifs présentent une volatilité particulièrement élevée. Cette
        simulation s&apos;appuie sur des données historiques :{" "}
        <span className="text-white/80">
          les performances passées ne préjugent en rien des performances futures
        </span>
        . Outil fourni à titre informatif et pédagogique — il ne constitue pas un
        conseil en investissement et ne tient compte ni de votre situation
        personnelle ni de la fiscalité.
      </p>
    </div>
  );
}
