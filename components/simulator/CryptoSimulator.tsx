"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runBacktest, type PricePoint } from "@/lib/backtest";
import type { Coin, Scenario } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ScenarioForm } from "./ScenarioForm";
import { ResultSummary } from "./ResultSummary";
import { ScenarioCompare } from "./ScenarioCompare";
import { ValueChart, type ChartLine } from "./ValueChart";
import { Disclaimer } from "./Disclaimer";
import { SaveSimulation } from "./SaveSimulation";
import { ShareButton } from "./ShareButton";
import { LeadCapture } from "./LeadCapture";
import { BenchmarkCompare } from "./BenchmarkCompare";
import { encodeScenario, type DecodedScenario } from "@/lib/share";

const ACCENTS = ["#1098f7", "#f8d047"];

interface HistoryEntry {
  status: "loading" | "ready" | "error";
  points: PricePoint[];
  range?: { from: number; to: number };
  source?: string;
  error?: string;
}

// Dates initiales DÉTERMINISTES (constantes, pas Date.now()) pour éviter tout
// mismatch d'hydratation ; elles sont recadrées sur la plage réelle de la
// crypto dès que son historique est chargé (cf. ensureHistory).
function defaultScenario(coinId: string): Scenario {
  return {
    coinId,
    amount: 100,
    frequency: "monthly",
    start: Date.UTC(2021, 0, 1),
    end: Date.UTC(2026, 0, 1),
  };
}

// Scénario initial = défauts, surchargés par un éventuel lien partagé.
function makeInitialScenario(initial?: DecodedScenario): Scenario {
  const base = defaultScenario(initial?.coinId ?? "bitcoin");
  if (!initial) return base;
  return {
    coinId: initial.coinId ?? base.coinId,
    amount: initial.amount ?? base.amount,
    frequency: initial.frequency ?? base.frequency,
    start: initial.start ?? base.start,
    end: initial.end ?? base.end,
  };
}

export function CryptoSimulator({
  embed = false,
  initial,
}: {
  embed?: boolean;
  initial?: DecodedScenario;
}) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coinsReady, setCoinsReady] = useState(false);
  const [compare, setCompare] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => [
    makeInitialScenario(initial),
  ]);
  const [histories, setHistories] = useState<Record<string, HistoryEntry>>({});
  const loadedRef = useRef<Set<string>>(new Set());
  // Cryptos dont les dates proviennent d'un lien partagé → ne pas recadrer
  // automatiquement sur l'historique complet (on borne juste à la plage).
  const skipAutoFrameRef = useRef<Set<string>>(
    new Set(initial?.coinId && initial.hasDates ? [initial.coinId] : [])
  );

  const coinOf = useCallback(
    (id: string) => coins.find((c) => c.id === id),
    [coins]
  );

  // Catalogue des cryptos
  useEffect(() => {
    let cancelled = false;
    fetch("/api/coins")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCoins(data.coins ?? []);
        setCoinsReady(true);
      })
      .catch(() => setCoinsReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Charge l'historique d'une crypto (une seule fois) puis cadre les dates.
  const ensureHistory = useCallback(async (id: string) => {
    if (loadedRef.current.has(id)) return;
    loadedRef.current.add(id);
    setHistories((h) => ({ ...h, [id]: { status: "loading", points: [] } }));
    try {
      const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      const points = data.points as PricePoint[];
      const range = { from: points[0].t, to: points[points.length - 1].t };
      setHistories((h) => ({
        ...h,
        [id]: { status: "ready", points, range, source: data.source },
      }));
      // Au 1er chargement d'une crypto, on cadre le scénario sur toute la
      // plage disponible (défaut = historique complet) — SAUF si les dates
      // viennent d'un lien partagé : on les borne alors à la plage dispo.
      setScenarios((scs) =>
        scs.map((s) => {
          if (s.coinId !== id) return s;
          if (skipAutoFrameRef.current.has(id)) {
            const clamp = (v: number) => Math.min(Math.max(v, range.from), range.to);
            return { ...s, start: clamp(s.start), end: clamp(s.end) };
          }
          return { ...s, start: range.from, end: range.to };
        })
      );
    } catch (e) {
      loadedRef.current.delete(id);
      setHistories((h) => ({
        ...h,
        [id]: { status: "error", points: [], error: String(e) },
      }));
    }
  }, []);

  useEffect(() => {
    scenarios.forEach((s) => ensureHistory(s.coinId));
  }, [scenarios, ensureHistory]);

  // Synchronise l'URL avec le scénario principal → lien toujours partageable
  // (sans navigation, via history.replaceState). Inactif en mode embed.
  useEffect(() => {
    if (embed || typeof window === "undefined") return;
    const qs = encodeScenario(scenarios[0]);
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  }, [scenarios, embed]);

  const updateScenario = useCallback(
    (index: number, patch: Partial<Scenario>) => {
      setScenarios((scs) =>
        scs.map((s, i) => {
          if (i !== index) return s;
          const next = { ...s, ...patch };
          // Changement de crypto : on cadre la fenêtre choisie dans la plage de
          // la nouvelle crypto (si connue). Si elle ne l'est pas encore,
          // ensureHistory la cadrera à son chargement.
          if (patch.coinId && patch.coinId !== s.coinId) {
            const range = histories[patch.coinId]?.range;
            if (range) {
              const clamp = (v: number) => Math.min(Math.max(v, range.from), range.to);
              next.start = clamp(s.start);
              next.end = clamp(s.end);
            }
          }
          return next;
        })
      );
    },
    [histories]
  );

  const toggleCompare = useCallback(() => {
    setCompare((c) => {
      const next = !c;
      setScenarios((scs) => {
        if (next && scs.length === 1) {
          const second = coins.find((co) => co.id !== scs[0].coinId && co.hasHistory);
          return [...scs, defaultScenario(second?.id ?? "ethereum")];
        }
        if (!next && scs.length > 1) return [scs[0]];
        return scs;
      });
      return next;
    });
  }, [coins]);

  const results = useMemo(
    () =>
      scenarios.map((s) => {
        const h = histories[s.coinId];
        if (!h || h.status !== "ready") return null;
        return runBacktest({
          amount: s.amount,
          frequency: s.frequency,
          prices: h.points,
          start: s.start,
          end: s.end,
        });
      }),
    [scenarios, histories]
  );

  const chartLines = useMemo<ChartLine[]>(() => {
    if (!compare) {
      const r = results[0];
      if (!r) return [];
      const color = r.profit >= 0 ? "#11d05a" : "#ff0500";
      return [
        {
          key: "inv",
          label: "Investi",
          color: "#9ca3af",
          points: r.series.map((p) => ({ t: p.t, v: p.invested })),
          dashed: true,
        },
        {
          key: "val",
          label: coinOf(scenarios[0].coinId)?.name ?? "Valeur",
          color,
          points: r.series.map((p) => ({ t: p.t, v: p.value })),
          fill: true,
        },
      ];
    }
    return results
      .map((r, i) =>
        r
          ? {
              key: `val${i}`,
              label: coinOf(scenarios[i].coinId)?.name ?? `Scénario ${i + 1}`,
              color: ACCENTS[i % ACCENTS.length],
              points: r.series.map((p) => ({ t: p.t, v: p.value })),
            }
          : null
      )
      .filter((l): l is ChartLine => l !== null);
  }, [compare, results, scenarios, coinOf]);

  const primaryHistory = histories[scenarios[0].coinId];
  const loadingPrimary =
    !coinsReady || !primaryHistory || primaryHistory.status === "loading";

  return (
    <div className={cn("grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]", embed && "lg:gap-4")}>
      {/* ─── Paramètres ─── */}
      <div className="space-y-4">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Paramètres</h2>
            <button
              type="button"
              onClick={toggleCompare}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                compare ? "bg-gold/15 text-gold" : "text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              {compare ? "Quitter la comparaison" : "+ Comparer"}
            </button>
          </div>

          <ScenarioForm
            scenario={scenarios[0]}
            coins={coins}
            range={histories[scenarios[0].coinId]?.range}
            onChange={(patch) => updateScenario(0, patch)}
            accent={compare ? ACCENTS[0] : undefined}
            badge={compare ? "Scénario 1" : undefined}
          />

          {compare && scenarios[1] && (
            <>
              <div className="my-5 h-px bg-white/8" />
              <ScenarioForm
                scenario={scenarios[1]}
                coins={coins}
                range={histories[scenarios[1].coinId]?.range}
                onChange={(patch) => updateScenario(1, patch)}
                accent={ACCENTS[1]}
                badge="Scénario 2"
              />
            </>
          )}
        </Card>

        {!embed && !compare && results[0] && (
          <>
            <ShareButton query={encodeScenario(scenarios[0])} />
            <SaveSimulation
              scenario={scenarios[0]}
              coin={coinOf(scenarios[0].coinId)}
              result={results[0]}
            />
          </>
        )}
      </div>

      {/* ─── Résultats ─── */}
      <div className="space-y-5">
        {loadingPrimary ? (
          <Card className="grid min-h-[420px] place-items-center">
            <span className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Chargement des données de marché…
            </span>
          </Card>
        ) : primaryHistory?.status === "error" ? (
          <Card className="grid min-h-[420px] place-items-center p-6 text-center">
            <p className="text-sm text-loss">
              Impossible de charger l&apos;historique de cette crypto.
              <br />
              <span className="text-muted">Essayez une autre cryptomonnaie.</span>
            </p>
          </Card>
        ) : (
          <>
            {!compare && results[0] && (
              <ResultSummary
                result={results[0]}
                coin={coinOf(scenarios[0].coinId)}
                frequency={scenarios[0].frequency}
              />
            )}

            <Card>
              <CardHeader
                title={compare ? "Comparaison des scénarios" : "Évolution de votre investissement"}
                subtitle={
                  primaryHistory?.source === "bundle"
                    ? "Historique hebdomadaire (données réelles)"
                    : "Historique live (≤ 1 an)"
                }
              />
              <div className="p-4">
                <ValueChart lines={chartLines} height={embed ? 260 : 320} />
                {!compare && (
                  <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-0.5 w-4 rounded bg-muted" /> Capital investi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-0.5 w-4 rounded"
                        style={{ background: (results[0]?.profit ?? 0) >= 0 ? "#11d05a" : "#ff0500" }}
                      />
                      Valeur du portefeuille
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {compare && (
              <ScenarioCompare
                rows={scenarios.map((s, i) => ({
                  accent: ACCENTS[i % ACCENTS.length],
                  coin: coinOf(s.coinId),
                  result: results[i],
                }))}
              />
            )}

            {!compare && results[0] && (
              <BenchmarkCompare
                scenario={scenarios[0]}
                coin={coinOf(scenarios[0].coinId)}
                result={results[0]}
              />
            )}

            {!embed && !compare && results[0] && (
              <LeadCapture
                scenario={scenarios[0]}
                coin={coinOf(scenarios[0].coinId)}
                result={results[0]}
              />
            )}

            <Disclaimer />
          </>
        )}
      </div>
    </div>
  );
}
