import { ImageResponse } from "next/og";
import { FALLBACK_COINS, getFallbackHistory } from "@/lib/fallback";
import { runBacktest, type Frequency } from "@/lib/backtest";
import { TOKEN_FREQ } from "@/lib/share";
import {
  formatEur,
  formatMonth,
  formatPct,
  formatSignedEur,
  fromISODate,
} from "@/lib/format";

// Image Open Graph générée à la volée pour chaque simulation partagée.
// (carte de marque S'investir avec la plus-value → fort taux de clic au partage)
export const revalidate = 3600;

const FREQ_DESC: Record<Frequency, string> = {
  once: "en une fois",
  monthly: "par mois",
  weekly: "par semaine",
  daily: "par jour",
};

const BRAND = {
  bg: "#080c16",
  ink: "#ffffff",
  muted: "#9ca3af",
  gain: "#11d05a",
  loss: "#ff0500",
  gold: "#f8d047",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get("coin") ?? "bitcoin";
    const amount = Math.min(
      100_000_000,
      Math.max(1, Math.round(Number(searchParams.get("montant")) || 100))
    );
    const frequency: Frequency = TOKEN_FREQ[searchParams.get("freq") ?? "mensuel"] ?? "monthly";

    const coin = FALLBACK_COINS.find((c) => c.id === coinId);
    const history = getFallbackHistory(coinId);

    let profit: number | null = null;
    let pct = 0;
    let invested = 0;
    let finalValue = 0;
    let start = NaN;
    let end = NaN;

    if (history && history.length > 1) {
      const s = fromISODate(searchParams.get("debut") ?? "");
      const e = fromISODate(searchParams.get("fin") ?? "");
      start = Number.isFinite(s) ? s : history[0].t;
      end = Number.isFinite(e) ? e : history[history.length - 1].t;
      const r = runBacktest({ amount, frequency, prices: history, start, end });
      profit = r.profit;
      pct = r.profitPct;
      invested = r.totalInvested;
      finalValue = r.finalValue;
    }

    const positive = (profit ?? 0) >= 0;
    const color = positive ? BRAND.gain : BRAND.loss;
    const coinName = coin?.name ?? coinId;
    const periodLabel =
      Number.isFinite(start) && Number.isFinite(end)
        ? `${formatMonth(start)} → ${formatMonth(end)}`
        : "";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            background: BRAND.bg,
            backgroundImage:
              "radial-gradient(900px 500px at 75% -10%, rgba(16,152,247,0.22), transparent 60%), radial-gradient(700px 460px at 0% 110%, rgba(0,73,198,0.18), transparent 55%)",
            color: BRAND.ink,
            fontFamily: "sans-serif",
          }}
        >
          {/* En-tête marque */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg,#ffe27a 0%,#f8d047 55%,#e7c53d 100%)",
                color: "#1a1400",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              S
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 30, fontWeight: 700 }}>S&apos;investir</div>
              <div style={{ fontSize: 20, color: BRAND.muted }}>Simulateur de plus-value crypto</div>
            </div>
          </div>

          {/* Corps : résultat */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "12px" }}>
            <div style={{ display: "flex", fontSize: 30, color: BRAND.muted }}>
              {coinName} · {formatEur(amount)} {FREQ_DESC[frequency]}
              {periodLabel ? ` · ${periodLabel}` : ""}
            </div>

            {profit !== null ? (
              <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "28px" }}>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 116,
                      fontWeight: 800,
                      color,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatSignedEur(profit)}
                  </div>
                  <div style={{ display: "flex", fontSize: 46, fontWeight: 700, color }}>
                    {formatPct(pct)}
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: 28, color: "#cbd5e1", whiteSpace: "nowrap" }}>
                  {formatEur(invested)} investis → {formatEur(finalValue)} de valeur finale
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", fontSize: 68, fontWeight: 800 }}>
                Simulez votre investissement crypto
              </div>
            )}
          </div>

          {/* Pied : disclaimer */}
          <div style={{ display: "flex", fontSize: 21, color: BRAND.muted }}>
            Backtest sur données historiques réelles — les performances passées ne préjugent pas
            des performances futures.
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    // Carte de repli (ne jamais renvoyer d'erreur à un crawler).
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#080c16",
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 800,
            fontFamily: "sans-serif",
          }}
        >
          S&apos;investir · Simulateur crypto
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
