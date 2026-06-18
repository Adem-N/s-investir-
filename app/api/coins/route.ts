import { NextResponse } from "next/server";
import { FALLBACK_COINS } from "@/lib/fallback";
import { fetchTopMarkets, type Coin } from "@/lib/coingecko";

// Catalogue des cryptos pour le sélecteur.
// Stratégie : cryptos embarquées (historique long terme garanti) EN PREMIER,
// complétées par le top CoinGecko live (catalogue élargi). Repli sur le seul
// dataset embarqué si l'API est indisponible.
export const revalidate = 3600;

export async function GET() {
  const bundled: Coin[] = FALLBACK_COINS.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    currentPrice: c.currentPrice,
    hasHistory: true,
  }));
  const bundledIds = new Set(bundled.map((c) => c.id));

  try {
    const live = await fetchTopMarkets(100);
    const extras = live.filter((c) => !bundledIds.has(c.id));
    return NextResponse.json({ coins: [...bundled, ...extras], source: "live+bundle" });
  } catch {
    return NextResponse.json({ coins: bundled, source: "bundle" });
  }
}
