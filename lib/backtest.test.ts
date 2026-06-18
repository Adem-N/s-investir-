import { describe, expect, it } from "vitest";
import {
  priceAt,
  scheduleDates,
  runBacktest,
  type PricePoint,
} from "./backtest";

const DAY = 86_400_000;
const d = (iso: string) => Date.parse(iso + "T00:00:00Z");

describe("priceAt", () => {
  const prices: PricePoint[] = [
    { t: d("2021-01-01"), price: 100 },
    { t: d("2021-01-02"), price: 200 },
    { t: d("2021-01-03"), price: 300 },
  ];

  it("renvoie le premier prix avant le début de la série", () => {
    expect(priceAt(prices, d("2020-12-01"))).toBe(100);
  });
  it("renvoie le dernier prix après la fin de la série", () => {
    expect(priceAt(prices, d("2022-01-01"))).toBe(300);
  });
  it("renvoie le dernier prix connu (<= t)", () => {
    expect(priceAt(prices, d("2021-01-02"))).toBe(200);
    expect(priceAt(prices, d("2021-01-02") + DAY / 2)).toBe(200);
  });
  it("gère une série vide", () => {
    expect(Number.isNaN(priceAt([], 0))).toBe(true);
  });
});

describe("scheduleDates", () => {
  it("once -> un seul versement", () => {
    expect(scheduleDates(d("2021-01-01"), d("2021-12-31"), "once")).toHaveLength(1);
  });
  it("monthly sur un an -> 12 versements", () => {
    expect(scheduleDates(d("2021-01-01"), d("2021-12-31"), "monthly")).toHaveLength(12);
  });
  it("weekly sur 4 semaines -> 5 versements (bornes incluses)", () => {
    expect(scheduleDates(d("2021-01-01"), d("2021-01-29"), "weekly")).toHaveLength(5);
  });
});

describe("runBacktest — lump sum", () => {
  const prices: PricePoint[] = [
    { t: d("2021-01-01"), price: 100 },
    { t: d("2021-06-01"), price: 150 },
    { t: d("2021-12-31"), price: 200 },
  ];

  it("double quand le prix double", () => {
    const r = runBacktest({
      amount: 1000,
      frequency: "once",
      prices,
      start: d("2021-01-01"),
      end: d("2021-12-31"),
    });
    expect(r.totalInvested).toBe(1000);
    expect(r.units).toBeCloseTo(10, 6); // 1000 / 100
    expect(r.finalValue).toBeCloseTo(2000, 6); // 10 * 200
    expect(r.profit).toBeCloseTo(1000, 6);
    expect(r.profitPct).toBeCloseTo(100, 6);
    expect(r.contributions).toBe(1);
    expect(r.avgBuyPrice).toBeCloseTo(100, 6);
  });

  it("tolère des dates inversées (start > end)", () => {
    const r = runBacktest({
      amount: 1000,
      frequency: "once",
      prices,
      start: d("2021-12-31"),
      end: d("2021-01-01"),
    });
    expect(r.finalValue).toBeCloseTo(2000, 6);
    expect(r.profit).toBeCloseTo(1000, 6);
  });

  it("produit une moins-value quand le prix baisse", () => {
    const r = runBacktest({
      amount: 500,
      frequency: "once",
      prices: [
        { t: d("2021-01-01"), price: 200 },
        { t: d("2021-12-31"), price: 100 },
      ],
      start: d("2021-01-01"),
      end: d("2021-12-31"),
    });
    expect(r.profit).toBeCloseTo(-250, 6);
    expect(r.profitPct).toBeCloseTo(-50, 6);
  });
});

describe("runBacktest — DCA", () => {
  it("prix constant -> plus-value nulle", () => {
    const prices: PricePoint[] = Array.from({ length: 13 }, (_, i) => ({
      t: d("2021-01-01") + i * 30 * DAY,
      price: 100,
    }));
    const r = runBacktest({
      amount: 100,
      frequency: "monthly",
      prices,
      start: d("2021-01-01"),
      end: d("2021-12-31"),
    });
    expect(r.contributions).toBe(12);
    expect(r.totalInvested).toBe(1200);
    expect(r.units).toBeCloseTo(12, 6);
    expect(r.profit).toBeCloseTo(0, 6);
  });

  it("DCA achète plus d'unités quand le prix est bas (prix de revient < prix moyen)", () => {
    // 2 versements : un à 50, un à 150 (prix moyen 100).
    const prices: PricePoint[] = [
      { t: d("2021-01-01"), price: 50 },
      { t: d("2021-02-01"), price: 150 },
    ];
    const r = runBacktest({
      amount: 300,
      frequency: "monthly",
      prices,
      start: d("2021-01-01"),
      end: d("2021-02-01"),
    });
    // units = 300/50 + 300/150 = 6 + 2 = 8 ; investi = 600 ; PRU = 75 < 100
    expect(r.units).toBeCloseTo(8, 6);
    expect(r.totalInvested).toBe(600);
    expect(r.avgBuyPrice).toBeCloseTo(75, 6);
  });
});

describe("runBacktest — série temporelle", () => {
  it("la série démarre à l'investi et finit à la valeur finale", () => {
    const prices: PricePoint[] = [
      { t: d("2021-01-01"), price: 100 },
      { t: d("2021-07-01"), price: 300 },
    ];
    const r = runBacktest({
      amount: 1000,
      frequency: "once",
      prices,
      start: d("2021-01-01"),
      end: d("2021-07-01"),
    });
    expect(r.series.length).toBeGreaterThanOrEqual(2);
    expect(r.series[0].invested).toBe(1000);
    expect(r.series[r.series.length - 1].value).toBeCloseTo(r.finalValue, 6);
  });
});
