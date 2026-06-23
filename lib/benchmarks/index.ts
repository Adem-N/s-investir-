/**
 * Comparaison « regard de partenaire » : et si le même plan d'investissement
 * (mêmes montants, même fréquence, même période) avait été placé sur un
 * support classique plutôt qu'en crypto ?
 *
 *  - MSCI World (ETF actions monde) — le placement long terme de référence
 *  - Livret A (épargne garantie, exonérée d'impôt)
 *  - Inflation (IPC France) — le seuil à battre pour préserver son pouvoir d'achat
 *
 * Astuce : chaque support est modélisé par un INDICE de prix synthétique qui
 * croît au rythme constaté, puis on réutilise exactement le même moteur
 * `runBacktest`. Investir `montant/indice(achat)` puis valoriser à
 * `parts·indice(fin)` reproduit fidèlement la capitalisation du support.
 *
 * Données (cf. SOURCES.md) :
 *  - MSCI World : performances annuelles NET total return en EUR (factsheets MSCI)
 *  - Livret A   : calendrier officiel des taux (Banque de France)
 *  - Inflation  : IPC France, moyenne annuelle (INSEE)
 *  2026 = année partielle / estimation prudente.
 */
import { runBacktest, type Frequency, type PricePoint } from "@/lib/backtest";

// Performance annuelle MSCI World — NET total return, EUR.
const MSCI_WORLD_ANNUAL_EUR: Record<number, number> = {
  2015: 0.1042,
  2016: 0.1073,
  2017: 0.0751,
  2018: -0.0411,
  2019: 0.3002,
  2020: 0.0633,
  2021: 0.3107,
  2022: -0.1278,
  2023: 0.196,
  2024: 0.266,
  2025: 0.0677,
  2026: 0.04, // partiel (estimation prudente)
};

// Inflation France — IPC ensemble des ménages, moyenne annuelle (INSEE).
const INFLATION_FR_ANNUAL: Record<number, number> = {
  2015: 0.0,
  2016: 0.002,
  2017: 0.01,
  2018: 0.018,
  2019: 0.011,
  2020: 0.005,
  2021: 0.016,
  2022: 0.052,
  2023: 0.049,
  2024: 0.02,
  2025: 0.009,
  2026: 0.012,
};

// Calendrier officiel du taux du Livret A (taux annuel en vigueur à partir de).
const LIVRET_A_SCHEDULE: { from: number; rate: number }[] = [
  { from: Date.UTC(2014, 7, 1), rate: 0.01 },
  { from: Date.UTC(2015, 7, 1), rate: 0.0075 },
  { from: Date.UTC(2020, 1, 1), rate: 0.005 },
  { from: Date.UTC(2022, 1, 1), rate: 0.01 },
  { from: Date.UTC(2022, 7, 1), rate: 0.02 },
  { from: Date.UTC(2023, 1, 1), rate: 0.03 },
  { from: Date.UTC(2025, 1, 1), rate: 0.024 },
  { from: Date.UTC(2025, 7, 1), rate: 0.017 },
  { from: Date.UTC(2026, 1, 1), rate: 0.015 },
];

const INDEX_FROM = Date.UTC(2014, 7, 1);
const INDEX_TO = Date.UTC(2026, 11, 1);

function livretRateAt(t: number): number {
  let rate = LIVRET_A_SCHEDULE[0].rate;
  for (const s of LIVRET_A_SCHEDULE) {
    if (t >= s.from) rate = s.rate;
    else break;
  }
  return rate;
}

/** Construit un indice de prix mensuel (base 100) capitalisant au taux annuel
 *  renvoyé par `annualRateAt` pour chaque mois. */
function buildIndex(annualRateAt: (t: number) => number): PricePoint[] {
  const pts: PricePoint[] = [];
  let index = 100;
  const d = new Date(INDEX_FROM);
  while (d.getTime() <= INDEX_TO) {
    pts.push({ t: d.getTime(), price: index });
    index *= Math.pow(1 + annualRateAt(d.getTime()), 1 / 12);
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return pts;
}

// Taux annuel pour l'année de `t`, en bornant l'année aux bornes connues de la
// table (extrapolation plate aux extrémités plutôt qu'une valeur inventée).
const yearRate = (table: Record<number, number>) => {
  const years = Object.keys(table).map(Number);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  return (t: number) => {
    const y = new Date(t).getUTCFullYear();
    return table[Math.min(Math.max(y, minY), maxY)];
  };
};

const MSCI_WORLD = buildIndex(yearRate(MSCI_WORLD_ANNUAL_EUR));
const LIVRET_A = buildIndex(livretRateAt);
const CPI_FR = buildIndex(yearRate(INFLATION_FR_ANNUAL));

export const FLAT_TAX = 0.3;

export interface BenchmarkRow {
  key: string;
  label: string;
  sublabel: string;
  kind: "crypto" | "etf" | "savings" | "inflation";
  finalValue: number;
  /** Plus-value brute (finalValue - investi) ; pour l'inflation = coût de l'érosion. */
  profit: number;
  /** Plus-value après flat tax 30 % (= profit si exonéré / non applicable). */
  netProfit: number;
  taxed: boolean;
}

function net(profit: number, taxed: boolean): number {
  return taxed && profit > 0 ? profit * (1 - FLAT_TAX) : profit;
}

/** Compare le résultat crypto aux supports classiques sur le MÊME plan. */
export function computeBenchmarks(
  params: { amount: number; frequency: Frequency; start: number; end: number },
  crypto: { label: string; finalValue: number; profit: number; totalInvested: number }
): { totalInvested: number; rows: BenchmarkRow[] } {
  const msci = runBacktest({ ...params, prices: MSCI_WORLD });
  const livret = runBacktest({ ...params, prices: LIVRET_A });
  const cpi = runBacktest({ ...params, prices: CPI_FR });
  // Base d'investissement de RÉFÉRENCE = celle du crypto (même calendrier de
  // versements). On recalcule chaque plus-value benchmark sur cette base
  // commune pour garantir une comparaison cohérente, quoi qu'il arrive.
  const totalInvested = crypto.totalInvested;
  const msciProfit = msci.finalValue - totalInvested;
  const livretProfit = livret.finalValue - totalInvested;
  const inflationCost = cpi.finalValue - totalInvested;

  const rows: BenchmarkRow[] = [
    {
      key: "crypto",
      label: crypto.label,
      sublabel: "votre simulation",
      kind: "crypto",
      finalValue: crypto.finalValue,
      profit: crypto.profit,
      netProfit: net(crypto.profit, true),
      taxed: true,
    },
    {
      key: "msci",
      label: "MSCI World",
      sublabel: "ETF actions monde",
      kind: "etf",
      finalValue: msci.finalValue,
      profit: msciProfit,
      netProfit: net(msciProfit, true),
      taxed: true,
    },
    {
      key: "livret",
      label: "Livret A",
      sublabel: "épargne garantie",
      kind: "savings",
      finalValue: livret.finalValue,
      profit: livretProfit,
      netProfit: livretProfit,
      taxed: false,
    },
    {
      key: "inflation",
      label: "Inflation",
      sublabel: "seuil pouvoir d'achat",
      kind: "inflation",
      finalValue: cpi.finalValue,
      profit: inflationCost,
      netProfit: inflationCost,
      taxed: false,
    },
  ];

  return { totalInvested, rows };
}
