export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      {/* Mark officiel S'investir (récupéré depuis sinvestir.fr).
         Référencé en <img> pour isoler ses dégradés SVG internes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/sinvestir-mark-gold.svg"
        alt="S'investir"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0"
      />
      {!compact && (
        <span className="text-[15px] font-semibold leading-none text-white">
          S&apos;investir{" "}
          <span className="font-normal text-muted">Simulateurs</span>
        </span>
      )}
    </span>
  );
}
