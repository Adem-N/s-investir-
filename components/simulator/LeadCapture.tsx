"use client";

import { useState } from "react";
import type { BacktestResult } from "@/lib/backtest";
import type { Coin, Scenario } from "@/lib/types";
import { saveLead } from "@/lib/leads-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

/**
 * Capture l'email au moment où l'utilisateur voit sa plus-value (intention
 * d'investir maximale) → lead pour le tunnel formation S'investir.
 */
export function LeadCapture({
  scenario,
  coin,
  result,
}: {
  scenario: Scenario;
  coin?: Coin;
  result: BacktestResult;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await saveLead({
        email,
        coin_id: scenario.coinId,
        coin_name: coin?.name ?? scenario.coinId,
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
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <Card className="border-gain/25 bg-gain/[0.06] p-5">
        <p className="text-sm font-semibold text-gain">Merci ✓ Votre simulation est enregistrée.</p>
        <p className="mt-1 text-xs text-muted">
          Vous recevrez votre analyse détaillée et le guide crypto S&apos;investir par email.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Recevez votre simulation détaillée</p>
          <p className="mt-0.5 text-xs text-muted">
            Votre analyse complète + le guide crypto S&apos;investir pour investir sereinement.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(inputClass, "flex-1")}
          aria-label="Votre adresse email"
        />
        <Button variant="gold" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Envoi…" : "Recevoir"}
        </Button>
      </form>

      {status === "error" ? (
        <p className="mt-2 text-xs text-loss">Une erreur est survenue. Réessayez.</p>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-muted/70">
        En validant, vous acceptez de recevoir des emails de S&apos;investir. Désinscription en 1 clic.
      </p>
    </Card>
  );
}
