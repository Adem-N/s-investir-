/**
 * Cœur métier du simulateur — fonctions PURES, sans dépendance réseau ni UI,
 * donc unitairement testables (cf. backtest.test.ts).
 *
 * On reproduit la logique du simulateur crypto de S'investir :
 *  - investissement « en une seule fois » (lump sum)
 *  - investissement progressif (DCA) : quotidien / hebdomadaire / mensuel
 * à partir de prix historiques réels, puis on calcule la plus-value / moins-value.
 */

export type Frequency = "once" | "daily" | "weekly" | "monthly";

export const FREQUENCIES: { value: Frequency; label: string; amountLabel: string }[] = [
  { value: "once", label: "Une fois", amountLabel: "Investissement unique" },
  { value: "monthly", label: "Mensuel", amountLabel: "Montant par mois" },
  { value: "weekly", label: "Hebdo", amountLabel: "Montant par semaine" },
  { value: "daily", label: "Quotidien", amountLabel: "Montant par jour" },
];

/** Un point de prix : timestamp (ms, UTC) + prix en EUR. */
export interface PricePoint {
  t: number;
  price: number;
}

export interface BacktestParams {
  /** Montant en EUR. Investissement unique si "once", sinon montant par versement. */
  amount: number;
  frequency: Frequency;
  /** Série de prix historiques (non triée tolérée). */
  prices: PricePoint[];
  /** Bornes de la simulation (timestamps ms). */
  start: number;
  end: number;
}

export interface SeriesPoint {
  t: number;
  /** Capital injecté cumulé à cette date. */
  invested: number;
  /** Valeur du portefeuille à cette date. */
  value: number;
}

export interface BacktestResult {
  totalInvested: number;
  finalValue: number;
  /** finalValue - totalInvested (la « plus-value ou moins-value »). */
  profit: number;
  /** Performance en % du capital investi. */
  profitPct: number;
  /** Quantité de crypto accumulée. */
  units: number;
  /** Prix de revient moyen (totalInvested / units). */
  avgBuyPrice: number;
  /** Nombre de versements effectués. */
  contributions: number;
  startPrice: number;
  endPrice: number;
  startDate: number;
  endDate: number;
  series: SeriesPoint[];
}

const MS_PER_DAY = 86_400_000;

/**
 * Prix « dernier connu » à la date t : on prend le dernier point dont le
 * timestamp est <= t (comportement réaliste de backtest). Recherche binaire.
 * La série DOIT être triée par timestamp croissant.
 */
export function priceAt(prices: PricePoint[], t: number): number {
  if (prices.length === 0) return NaN;
  if (t <= prices[0].t) return prices[0].price;
  const last = prices[prices.length - 1];
  if (t >= last.t) return last.price;

  let lo = 0;
  let hi = prices.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (prices[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return prices[lo].price;
}

/** Génère le calendrier des versements de `start` à `end` selon la fréquence. */
export function scheduleDates(start: number, end: number, frequency: Frequency): number[] {
  if (frequency === "once") return [start];

  const dates: number[] = [];
  const d = new Date(start);
  // Garde-fou : on borne à un nombre raisonnable d'itérations.
  for (let i = 0; i < 20_000 && d.getTime() <= end; i++) {
    dates.push(d.getTime());
    if (frequency === "daily") d.setUTCDate(d.getUTCDate() + 1);
    else if (frequency === "weekly") d.setUTCDate(d.getUTCDate() + 7);
    else d.setUTCMonth(d.getUTCMonth() + 1); // monthly
  }
  return dates;
}

/** Exécute le backtest et renvoie tous les indicateurs + la série temporelle. */
export function runBacktest(params: BacktestParams): BacktestResult {
  const { amount, frequency } = params;
  // Tolère un ordre de dates inversé (ex. saisie utilisateur).
  const start = Math.min(params.start, params.end);
  const end = Math.max(params.start, params.end);
  const prices = [...params.prices].sort((a, b) => a.t - b.t);

  const startPrice = priceAt(prices, start);
  const endPrice = priceAt(prices, end);

  // Achats : un versement de `amount` à chaque date du calendrier.
  const purchases = scheduleDates(start, end, frequency)
    .map((t) => {
      const price = priceAt(prices, t);
      return { t, amount, units: amount / price, price };
    })
    .filter((p) => Number.isFinite(p.units) && p.units > 0)
    .sort((a, b) => a.t - b.t);

  const totalInvested = purchases.reduce((s, p) => s + p.amount, 0);
  const units = purchases.reduce((s, p) => s + p.units, 0);
  const finalValue = units * endPrice;
  const profit = finalValue - totalInvested;
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  // Série temporelle pour le graphe : un point par prix de la fenêtre [start, end].
  const window = prices.filter((p) => p.t >= start && p.t <= end);
  const series: SeriesPoint[] = [];
  let pi = 0;
  let investedAcc = 0;
  let unitsAcc = 0;
  for (const pt of window) {
    while (pi < purchases.length && purchases[pi].t <= pt.t) {
      investedAcc += purchases[pi].amount;
      unitsAcc += purchases[pi].units;
      pi++;
    }
    series.push({ t: pt.t, invested: investedAcc, value: unitsAcc * pt.price });
  }
  // Point final garanti (au cas où `end` tombe entre deux prix de la fenêtre).
  while (pi < purchases.length) {
    investedAcc += purchases[pi].amount;
    unitsAcc += purchases[pi].units;
    pi++;
  }
  const lastT = series.length ? series[series.length - 1].t : start;
  if (lastT < end || series.length === 0) {
    series.push({ t: end, invested: investedAcc, value: unitsAcc * endPrice });
  }

  return {
    totalInvested,
    finalValue,
    profit,
    profitPct,
    units,
    avgBuyPrice: units > 0 ? totalInvested / units : NaN,
    contributions: purchases.length,
    startPrice,
    endPrice,
    startDate: start,
    endDate: end,
    series,
  };
}

/** Performance annualisée (CAGR) approximée sur la durée de la simulation. */
export function annualizedReturn(result: BacktestResult): number {
  const years = (result.endDate - result.startDate) / (365 * MS_PER_DAY);
  if (years <= 0 || result.totalInvested <= 0 || result.finalValue <= 0) return 0;
  // Approximation lump-sum : (Vf / Vi)^(1/years) - 1.
  return (Math.pow(result.finalValue / result.totalInvested, 1 / years) - 1) * 100;
}
