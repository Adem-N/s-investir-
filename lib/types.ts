import type { Frequency } from "@/lib/backtest";

/** Une crypto du catalogue (sélecteur). */
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number | null;
  /** true si un historique long terme embarqué existe pour cette crypto. */
  hasHistory: boolean;
}

/** Paramètres d'un scénario de simulation. */
export interface Scenario {
  coinId: string;
  amount: number;
  frequency: Frequency;
  /** Bornes en ms (UTC). */
  start: number;
  end: number;
}
