import { annualizedReturn, type BacktestResult, FREQUENCIES, type Frequency } from "@/lib/backtest";
import type { Coin } from "@/lib/types";
import {
  formatEur,
  formatPct,
  formatPrice,
  formatSignedEur,
  formatUnits,
} from "@/lib/format";
import { Stat } from "@/components/ui/Stat";
import { cn } from "@/lib/cn";

export function ResultSummary({
  result,
  coin,
  frequency,
}: {
  result: BacktestResult;
  coin?: Coin;
  frequency: Frequency;
}) {
  const positive = result.profit >= 0;
  const isDCA = frequency !== "once";
  const freqLabel = FREQUENCIES.find((f) => f.value === frequency)?.label ?? "";

  return (
    <div>
      {/* Bandeau plus-value / moins-value */}
      <div
        className={cn(
          "rounded-2xl border p-5",
          positive
            ? "border-gain/25 bg-gain/[0.06]"
            : "border-loss/25 bg-loss/[0.06]"
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {positive ? "Plus-value" : "Moins-value"}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={cn(
              "text-3xl font-bold tabular-nums sm:text-4xl",
              positive ? "text-gain" : "text-loss"
            )}
          >
            {formatSignedEur(result.profit)}
          </span>
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-sm font-semibold tabular-nums",
              positive ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
            )}
          >
            {formatPct(result.profitPct)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          {formatEur(result.totalInvested)} investis →{" "}
          <span className="font-medium text-white">{formatEur(result.finalValue)}</span> de
          valeur finale
        </p>
      </div>

      {/* Indicateurs détaillés */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Montant total investi" value={formatEur(result.totalInvested)} />
        <Stat label="Valeur finale" value={formatEur(result.finalValue)} tone="brand" />
        <Stat
          label="Performance annualisée"
          value={formatPct(annualizedReturn(result))}
          tone={positive ? "gain" : "loss"}
        />
        <Stat
          label={`Quantité ${coin?.symbol ?? ""}`}
          value={formatUnits(result.units)}
        />
        <Stat label="Prix de revient moyen" value={formatPrice(result.avgBuyPrice)} />
        <Stat
          label={isDCA ? "Nombre de versements" : "Type"}
          value={isDCA ? `${result.contributions}` : "En une fois"}
          hint={isDCA ? freqLabel : undefined}
        />
      </div>
    </div>
  );
}
