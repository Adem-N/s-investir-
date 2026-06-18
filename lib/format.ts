/** Formatage localisé (fr-FR) : euros, pourcentages, quantités, dates. */

const eur0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eur2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const monthFmt = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

export function formatEur(n: number, decimals: 0 | 2 = 0): string {
  if (!Number.isFinite(n)) return "—";
  return (decimals === 2 ? eur2 : eur0).format(n);
}

/** Euros avec signe explicite (pour la plus-value / moins-value). */
export function formatSignedEur(n: number, decimals: 0 | 2 = 0): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return sign + formatEur(n, decimals);
}

export function formatPct(n: number, withSign = true): string {
  if (!Number.isFinite(n)) return "—";
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

/** Prix unitaire d'une crypto : décimales adaptatives (de 0,00012 à 64 000). */
export function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return eur0.format(n);
  if (n >= 1) return eur2.format(n);
  const digits = n >= 0.01 ? 4 : 8;
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: digits }) + " €";
}

/** Quantité de crypto accumulée : jusqu'à 6 chiffres significatifs. */
export function formatUnits(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const digits = n >= 1000 ? 2 : n >= 1 ? 4 : 6;
  return n.toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

export function formatDate(t: number): string {
  if (!Number.isFinite(t)) return "—";
  return dateFmt.format(new Date(t));
}

export function formatMonth(t: number): string {
  if (!Number.isFinite(t)) return "—";
  return monthFmt.format(new Date(t));
}

/** "yyyy-mm-dd" (UTC) — pour les <input type="date">. "" si invalide. */
export function toISODate(t: number): string {
  if (!Number.isFinite(t)) return "";
  return new Date(t).toISOString().slice(0, 10);
}

/** "yyyy-mm-dd" (UTC, minuit) -> timestamp ms (NaN si chaîne vide/invalide). */
export function fromISODate(s: string): number {
  return Date.parse(s + "T00:00:00Z");
}
