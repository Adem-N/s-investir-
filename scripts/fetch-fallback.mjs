/**
 * Génère le dataset historique EMBARQUÉ (fallback offline).
 *
 * Pourquoi : l'API gratuite de CoinGecko plafonne l'historique à 365 jours.
 * Pour des backtests sur plusieurs années (le cœur de l'outil), on embarque
 * un historique réel complet, récupéré une fois ici :
 *   - catalogue + logos + prix actuels : CoinGecko /coins/markets (public)
 *   - historique hebdo EUR : Binance klines (gratuit, sans clé, depuis ~2019-2020)
 *
 * Sortie :
 *   lib/fallback/coins.json            -> [{ id, symbol, name, image, currentPrice }]
 *   lib/fallback/history/<id>.json     -> [[timestampMs, prixEUR], ...] (hebdomadaire)
 *
 * Lancer : npm run fetch:data
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "lib", "fallback");

// id CoinGecko (clé canonique) -> symbole + paire Binance EUR
const COINS = [
  { id: "bitcoin", cc: "BTC", bn: "BTCEUR" },
  { id: "ethereum", cc: "ETH", bn: "ETHEUR" },
  { id: "solana", cc: "SOL", bn: "SOLEUR" },
  { id: "binancecoin", cc: "BNB", bn: "BNBEUR" },
  { id: "ripple", cc: "XRP", bn: "XRPEUR" },
  { id: "cardano", cc: "ADA", bn: "ADAEUR" },
  { id: "dogecoin", cc: "DOGE", bn: "DOGEEUR" },
  { id: "polkadot", cc: "DOT", bn: "DOTEUR" },
  { id: "chainlink", cc: "LINK", bn: "LINKEUR" },
  { id: "litecoin", cc: "LTC", bn: "LTCEUR" },
  { id: "avalanche-2", cc: "AVAX", bn: "AVAXEUR" },
  { id: "tron", cc: "TRX", bn: "TRXEUR" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, opts) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

/** Manifest (nom, logo, prix actuel) via CoinGecko. Fallback minimal si l'appel échoue. */
async function fetchManifest() {
  const ids = COINS.map((c) => c.id).join(",");
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${ids}&order=market_cap_desc&sparkline=false&per_page=250`;
  try {
    const data = await getJSON(url);
    const byId = new Map(data.map((c) => [c.id, c]));
    return COINS.map((c) => {
      const m = byId.get(c.id);
      return {
        id: c.id,
        symbol: (m?.symbol ?? c.cc).toUpperCase(),
        name: m?.name ?? c.id,
        image: m?.image ?? "",
        currentPrice: m?.current_price ?? null,
      };
    });
  } catch (e) {
    console.warn("⚠️  CoinGecko markets indisponible, manifest minimal:", e.message);
    return COINS.map((c) => ({
      id: c.id,
      symbol: c.cc,
      name: c.id,
      image: "",
      currentPrice: null,
    }));
  }
}

/** Historique hebdomadaire (EUR) via Binance klines (close de chaque semaine). */
async function fetchHistory(bn) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${bn}&interval=1w&limit=1000`;
  const data = await getJSON(url);
  if (!Array.isArray(data)) throw new Error(data?.msg || "Binance error");
  // kline = [openTime, open, high, low, close, volume, closeTime, ...]
  const rows = data
    .map((k) => [k[0], Math.round(parseFloat(k[4]) * 100) / 100])
    .filter((r) => r[1] > 0);
  if (rows.length === 0) throw new Error("Binance: série vide");
  return rows;
}

async function main() {
  await mkdir(join(OUT, "history"), { recursive: true });

  console.log("→ Manifest CoinGecko…");
  const manifest = await fetchManifest();

  const kept = [];
  for (const coin of COINS) {
    process.stdout.write(`→ ${coin.cc} (${coin.id})… `);
    try {
      const series = await fetchHistory(coin.bn);
      await writeFile(
        join(OUT, "history", `${coin.id}.json`),
        JSON.stringify(series)
      );
      const first = new Date(series[0][0]).toISOString().slice(0, 10);
      console.log(`${series.length} pts (depuis ${first})`);
      kept.push(coin.id);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(400); // courtoisie envers l'API gratuite
  }

  const finalManifest = manifest.filter((m) => kept.includes(m.id));
  await writeFile(join(OUT, "coins.json"), JSON.stringify(finalManifest, null, 2));
  console.log(`\n✅ ${kept.length} cryptos embarquées -> lib/fallback/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
