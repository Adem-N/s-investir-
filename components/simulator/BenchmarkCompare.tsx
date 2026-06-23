"use client";

import { useMemo } from "react";
import type { BacktestResult } from "@/lib/backtest";
import type { Coin, Scenario } from "@/lib/types";
import { computeBenchmarks, type BenchmarkRow } from "@/lib/benchmarks";
import { formatEur, formatSignedEur } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

function barColor(r: BenchmarkRow): string {
  switch (r.kind) {
    case "crypto":
      return r.profit >= 0 ? "#11d05a" : "#ff0500";
    case "etf":
      return "#1098f7";
    case "savings":
      return "#f8d047";
    default:
      return "#9ca3af";
  }
}

export function BenchmarkCompare({
  scenario,
  coin,
  result,
}: {
  scenario: Scenario;
  coin?: Coin;
  result: BacktestResult;
}) {
  const { totalInvested, rows } = useMemo(
    () =>
      computeBenchmarks(
        {
          amount: scenario.amount,
          frequency: scenario.frequency,
          start: scenario.start,
          end: scenario.end,
        },
        {
          label: coin?.name ?? scenario.coinId,
          finalValue: result.finalValue,
          profit: result.profit,
          totalInvested: result.totalInvested,
        }
      ),
    [scenario, coin, result]
  );

  const max = Math.max(...rows.map((r) => r.finalValue), 1);

  return (
    <Card>
      <CardHeader
        title="Et avec un placement classique ?"
        subtitle={`${formatEur(totalInvested)} investis · le même plan, sur la même période`}
      />
      <div className="space-y-4 p-4">
        {rows.map((r) => {
          const positive = r.profit >= 0;
          return (
            <div key={r.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      r.kind === "crypto" ? "text-white" : "text-white/90"
                    )}
                  >
                    {r.label}
                  </span>
                  <span className="text-xs text-muted">{r.sublabel}</span>
                </span>
                <span className="font-semibold tabular-nums text-white">
                  {formatEur(r.finalValue)}
                </span>
              </div>

              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(r.finalValue / max) * 100}%`, background: barColor(r) }}
                />
              </div>

              <div className="mt-1 text-xs tabular-nums">
                {r.kind === "inflation" ? (
                  <span className="text-muted">
                    Seuil pour préserver votre pouvoir d&apos;achat
                  </span>
                ) : (
                  <span className={positive ? "text-gain" : "text-loss"}>
                    {formatSignedEur(r.profit)}
                    {r.taxed && r.profit > 0 ? (
                      <span className="text-muted">
                        {" "}
                        · net flat tax {formatSignedEur(r.netProfit)}
                      </span>
                    ) : !r.taxed && r.kind === "savings" ? (
                      <span className="text-muted"> · exonéré d&apos;impôt</span>
                    ) : null}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <p className="border-t border-white/8 pt-3 text-[11px] leading-relaxed text-muted/70">
          Plus-value nette après flat tax 30 % (crypto & ETF en compte-titres) ; Livret A exonéré.
          MSCI World : indice net total return (EUR), trajectoire reconstituée à partir des
          performances annuelles officielles. Inflation : IPC France (INSEE). Données 2026 partielles.
        </p>
      </div>
    </Card>
  );
}
