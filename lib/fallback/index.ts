/**
 * Accès au dataset historique embarqué (généré par scripts/fetch-fallback.mjs).
 * Sert de source PRINCIPALE pour les backtests longue durée — l'API gratuite
 * de CoinGecko étant plafonnée à 365 jours.
 */
import type { PricePoint } from "@/lib/backtest";
import coins from "./coins.json";

import bitcoin from "./history/bitcoin.json";
import ethereum from "./history/ethereum.json";
import solana from "./history/solana.json";
import binancecoin from "./history/binancecoin.json";
import ripple from "./history/ripple.json";
import cardano from "./history/cardano.json";
import dogecoin from "./history/dogecoin.json";
import polkadot from "./history/polkadot.json";
import chainlink from "./history/chainlink.json";
import litecoin from "./history/litecoin.json";
import avalanche2 from "./history/avalanche-2.json";
import tron from "./history/tron.json";

export interface FallbackCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number | null;
}

export const FALLBACK_COINS = coins as FallbackCoin[];

const HISTORY: Record<string, number[][]> = {
  bitcoin,
  ethereum,
  solana,
  binancecoin,
  ripple,
  cardano,
  dogecoin,
  polkadot,
  chainlink,
  litecoin,
  "avalanche-2": avalanche2,
  tron,
};

export function hasFallback(id: string): boolean {
  return id in HISTORY;
}

/** Série de prix embarquée (triée) pour une crypto, ou null si absente. */
export function getFallbackHistory(id: string): PricePoint[] | null {
  const raw = HISTORY[id];
  if (!raw) return null;
  return raw.map(([t, price]) => ({ t, price }));
}

/** Plage [from, to] couverte par les données embarquées d'une crypto. */
export function getFallbackRange(id: string): { from: number; to: number } | null {
  const raw = HISTORY[id];
  if (!raw || raw.length === 0) return null;
  return { from: raw[0][0], to: raw[raw.length - 1][0] };
}
