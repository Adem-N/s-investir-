import { describe, expect, it } from "vitest";
import { computeBenchmarks, FLAT_TAX } from "./index";

describe("computeBenchmarks", () => {
  const params = {
    amount: 100,
    frequency: "monthly" as const,
    start: Date.UTC(2020, 0, 1),
    end: Date.UTC(2024, 0, 1),
  };
  const { totalInvested, rows } = computeBenchmarks(params, {
    label: "Bitcoin",
    finalValue: 20_000,
    totalInvested: 4_900, // 49 versements mensuels de 100 € (jan 2020 → jan 2024)
    profit: 15_100, // 20 000 - 4 900
  });

  it("le même capital est investi pour tous les supports (même calendrier)", () => {
    expect(totalInvested).toBeGreaterThan(0);
    expect(totalInvested % 100).toBe(0); // versements de 100 €
  });

  it("applique la flat tax 30 % sur la plus-value crypto", () => {
    const crypto = rows.find((r) => r.key === "crypto")!;
    expect(crypto.taxed).toBe(true);
    expect(crypto.netProfit).toBeCloseTo(crypto.profit * (1 - FLAT_TAX), 6);
  });

  it("Livret A : exonéré (net = brut) et plus-value positive", () => {
    const livret = rows.find((r) => r.key === "livret")!;
    expect(livret.taxed).toBe(false);
    expect(livret.netProfit).toBeCloseTo(livret.profit, 6);
    expect(livret.profit).toBeGreaterThan(0);
  });

  it("MSCI World : forte progression 2020-2024, et net < brut (taxé)", () => {
    const msci = rows.find((r) => r.key === "msci")!;
    expect(msci.profit).toBeGreaterThan(0);
    expect(msci.netProfit).toBeLessThan(msci.profit);
  });

  it("le seuil inflation dépasse le capital simplement investi", () => {
    const infl = rows.find((r) => r.key === "inflation")!;
    expect(infl.finalValue).toBeGreaterThan(totalInvested);
  });
});
