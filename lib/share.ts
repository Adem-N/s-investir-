/**
 * Encodage / décodage d'un scénario dans l'URL → liens de résultat
 * partageables et bookmarkables (croissance virale + image OG dynamique).
 */
import type { Frequency } from "@/lib/backtest";
import { fromISODate, toISODate } from "@/lib/format";

const FREQ_TOKEN: Record<Frequency, string> = {
  once: "unique",
  monthly: "mensuel",
  weekly: "hebdo",
  daily: "quotidien",
};
const TOKEN_FREQ: Record<string, Frequency> = {
  unique: "once",
  mensuel: "monthly",
  hebdo: "weekly",
  quotidien: "daily",
};

export interface DecodedScenario {
  coinId?: string;
  amount?: number;
  frequency?: Frequency;
  start?: number;
  end?: number;
  /** true si l'URL portait des dates explicites (→ ne pas recadrer auto). */
  hasDates: boolean;
}

/** Scénario → query string lisible (`coin=bitcoin&montant=100&freq=mensuel&…`). */
export function encodeScenario(s: {
  coinId: string;
  amount: number;
  frequency: Frequency;
  start: number;
  end: number;
}): string {
  const p = new URLSearchParams();
  p.set("coin", s.coinId);
  if (Number.isFinite(s.amount)) p.set("montant", String(Math.round(s.amount)));
  p.set("freq", FREQ_TOKEN[s.frequency] ?? "mensuel");
  if (Number.isFinite(s.start)) p.set("debut", toISODate(s.start));
  if (Number.isFinite(s.end)) p.set("fin", toISODate(s.end));
  return p.toString();
}

/** Lit les paramètres d'URL (côté serveur ou client) → scénario partiel. */
export function decodeScenario(params: URLSearchParams): DecodedScenario | null {
  const coin = params.get("coin");
  const montant = params.get("montant");
  const freq = params.get("freq");
  const debut = params.get("debut");
  const fin = params.get("fin");
  if (!coin && !montant && !freq && !debut && !fin) return null;

  const out: DecodedScenario = { hasDates: false };
  if (coin) out.coinId = coin;
  if (montant != null) {
    const n = Number(montant);
    if (Number.isFinite(n) && n > 0) out.amount = n;
  }
  if (freq && TOKEN_FREQ[freq]) out.frequency = TOKEN_FREQ[freq];

  const start = debut ? fromISODate(debut) : NaN;
  const end = fin ? fromISODate(fin) : NaN;
  if (Number.isFinite(start)) out.start = start;
  if (Number.isFinite(end)) out.end = end;
  out.hasDates = Number.isFinite(start) && Number.isFinite(end);
  return out;
}

export { TOKEN_FREQ };
