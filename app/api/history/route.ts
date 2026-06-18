import { NextResponse } from "next/server";
import { getFallbackHistory } from "@/lib/fallback";
import { fetchLiveHistory } from "@/lib/coingecko";

// Série de prix historiques (EUR) pour une crypto.
// 1) dataset embarqué (historique long terme, fiable) si disponible
// 2) sinon CoinGecko live (<= 365 j) pour les cryptos hors bundle
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "param `id` requis" }, { status: 400 });
  }

  const bundled = getFallbackHistory(id);
  if (bundled) {
    return NextResponse.json({ id, points: bundled, source: "bundle" });
  }

  // Crypto hors bundle : on tente l'historique live (limité à 365 j).
  const now = Date.now();
  const from = Number(searchParams.get("from")) || now - 365 * 86_400_000;
  const to = Number(searchParams.get("to")) || now;
  try {
    const points = await fetchLiveHistory(id, from, to);
    return NextResponse.json({ id, points, source: "live" });
  } catch (e) {
    return NextResponse.json(
      { error: `Historique indisponible pour « ${id} »`, detail: String(e) },
      { status: 502 }
    );
  }
}
