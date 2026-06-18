"use client";

import { useState } from "react";
import Link from "next/link";
import type { BacktestResult } from "@/lib/backtest";
import type { Coin, Scenario } from "@/lib/types";
import { saveSimulation } from "@/lib/simulations-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function SaveSimulation({
  scenario,
  coin,
  result,
}: {
  scenario: Scenario;
  coin?: Coin;
  result: BacktestResult;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    if (!coin) return;
    setState("saving");
    try {
      await saveSimulation({
        coin_id: coin.id,
        coin_name: coin.name,
        coin_symbol: coin.symbol,
        params: {
          amount: scenario.amount,
          frequency: scenario.frequency,
          start: scenario.start,
          end: scenario.end,
        },
        result: {
          totalInvested: result.totalInvested,
          finalValue: result.finalValue,
          profit: result.profit,
          profitPct: result.profitPct,
        },
      });
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      {state === "saved" ? (
        <>
          <p className="text-sm text-gain">Simulation enregistrée ✓</p>
          <Link href="/mes-simulations">
            <Button variant="outline" size="sm">
              Voir mes simulations
            </Button>
          </Link>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-white">Garder cette simulation</p>
            <p className="text-xs text-muted">
              {state === "error" ? "Échec de l'enregistrement." : "Retrouvez-la dans « Mes simulations »."}
            </p>
          </div>
          <Button variant="gold" size="sm" onClick={handleSave} disabled={state === "saving"}>
            {state === "saving" ? <Spinner className="border-black/30 border-t-black" /> : "Sauvegarder"}
          </Button>
        </>
      )}
    </Card>
  );
}
