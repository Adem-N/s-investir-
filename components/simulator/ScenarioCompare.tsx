import type { BacktestResult } from "@/lib/backtest";
import type { Coin } from "@/lib/types";
import { formatEur, formatPct, formatSignedEur } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface CompareRow {
  accent: string;
  coin?: Coin;
  result: BacktestResult | null;
}

export function ScenarioCompare({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.03] text-left text-xs text-muted">
            <th className="px-4 py-2.5 font-medium">Scénario</th>
            <th className="px-4 py-2.5 text-right font-medium">Investi</th>
            <th className="px-4 py-2.5 text-right font-medium">Valeur finale</th>
            <th className="px-4 py-2.5 text-right font-medium">Plus / moins-value</th>
            <th className="px-4 py-2.5 text-right font-medium">Perf.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const r = row.result;
            const positive = (r?.profit ?? 0) >= 0;
            return (
              <tr key={i} className="border-t border-white/8">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: row.accent }}
                    />
                    <span className="font-medium text-white">
                      {row.coin?.name ?? "—"}
                    </span>
                    <span className="text-xs text-muted">{row.coin?.symbol}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">
                  {r ? formatEur(r.totalInvested) : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-white">
                  {r ? formatEur(r.finalValue) : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums",
                    positive ? "text-gain" : "text-loss"
                  )}
                >
                  {r ? formatSignedEur(r.profit) : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums",
                    positive ? "text-gain" : "text-loss"
                  )}
                >
                  {r ? formatPct(r.profitPct) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
