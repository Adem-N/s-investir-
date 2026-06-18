/**
 * Client CoinGecko (côté serveur uniquement) — catalogue, logos, prix actuels,
 * et historique récent (<= 365 j sur l'offre gratuite). Utilisé en complément
 * du dataset embarqué (cf. lib/fallback).
 */
import type { PricePoint } from "@/lib/backtest";
import type { Coin } from "@/lib/types";

export type { Coin };

const BASE = "https://api.coingecko.com/api/v3";

function headers(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

/**
 * Top cryptos par capitalisation (catalogue du sélecteur).
 * Cache 1h (revalidate) pour rester sous les quotas gratuits.
 */
export async function fetchTopMarkets(perPage = 100): Promise<Coin[]> {
  const url = `${BASE}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`CoinGecko markets ${res.status}`);
  const data = (await res.json()) as Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number | null;
  }>;
  return data.map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    image: c.image,
    currentPrice: c.current_price,
    hasHistory: false,
  }));
}

/**
 * Historique récent (<= 365 j) pour une crypto absente du dataset embarqué.
 * Renvoie une série de points {t, price} en EUR.
 */
export async function fetchLiveHistory(
  id: string,
  fromMs: number,
  toMs: number
): Promise<PricePoint[]> {
  const from = Math.floor(fromMs / 1000);
  const to = Math.floor(toMs / 1000);
  const url = `${BASE}/coins/${id}/market_chart/range?vs_currency=eur&from=${from}&to=${to}`;
  const res = await fetch(url, { headers: headers(), next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`CoinGecko history ${res.status}`);
  const data = (await res.json()) as { prices?: [number, number][] };
  if (!data.prices?.length) throw new Error("CoinGecko: série vide");
  return data.prices.map(([t, price]) => ({ t, price }));
}
