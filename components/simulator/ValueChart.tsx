"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDate, formatEur } from "@/lib/format";

export interface ChartLine {
  key: string;
  label: string;
  color: string;
  points: { t: number; v: number }[];
  /** Tracer une aire dégradée sous la courbe (scénario unique). */
  fill?: boolean;
  /** Trait pointillé (ex. capital investi). */
  dashed?: boolean;
}

const PAD = { top: 16, right: 16, bottom: 26, left: 56 };

function compactEur(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M€`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1000)} k€`;
  return `${Math.round(v)} €`;
}

/** Dernier point dont t <= cible (recherche binaire). */
function nearest(points: { t: number; v: number }[], t: number) {
  if (points.length === 0) return null;
  let lo = 0;
  let hi = points.length - 1;
  if (t <= points[0].t) return points[0];
  if (t >= points[hi].t) return points[hi];
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (points[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return points[lo];
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.max(280, e.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function ValueChart({
  lines,
  height = 300,
}: {
  lines: ChartLine[];
  height?: number;
}) {
  const [ref, width] = useWidth();
  const gradId = useId();
  const [hoverT, setHoverT] = useState<number | null>(null);

  const all = lines.flatMap((l) => l.points);
  const domain = useMemo(() => {
    if (all.length === 0) return null;
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMax = 0;
    for (const p of all) {
      if (p.t < xMin) xMin = p.t;
      if (p.t > xMax) xMax = p.t;
      if (p.v > yMax) yMax = p.v;
    }
    return { xMin, xMax, yMax: yMax * 1.08 || 1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  if (!domain) {
    return (
      <div
        ref={ref}
        className="grid place-items-center rounded-xl border border-white/8 bg-black/20 text-sm text-muted"
        style={{ height }}
      >
        Aucune donnée à afficher
      </div>
    );
  }

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const { xMin, xMax, yMax } = domain;

  const sx = (t: number) =>
    PAD.left + (xMax === xMin ? 0 : ((t - xMin) / (xMax - xMin)) * innerW);
  const sy = (v: number) => PAD.top + (1 - v / yMax) * innerH;

  const pathFor = (pts: { t: number; v: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.t).toFixed(1)} ${sy(p.v).toFixed(1)}`).join(" ");

  const yTicks = Array.from({ length: 4 }, (_, i) => (yMax / 4) * (i + 1));
  const xTicks = Array.from({ length: 4 }, (_, i) => xMin + ((xMax - xMin) / 3) * i);

  // Signature qui change quand une "nouvelle courbe" apparaît (crypto, fenêtre
  // de dates, ou bascule comparaison) → rejoue l'animation de tracé. Un simple
  // changement de montant ne la modifie pas (même label + même nb de points).
  const animKey = lines.map((l) => `${l.label}#${l.points.length}`).join("|");

  const hover = hoverT == null ? null : hoverT;
  const hoverPoints =
    hover == null
      ? []
      : lines.map((l) => ({ line: l, pt: nearest(l.points, hover) })).filter((h) => h.pt);
  const hoverX = hover == null ? 0 : sx(hover);

  return (
    <div ref={ref} className="relative select-none" style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Évolution de la valeur du portefeuille"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const ratio = Math.min(1, Math.max(0, (x - PAD.left) / innerW));
          setHoverT(xMin + ratio * (xMax - xMin));
        }}
        onMouseLeave={() => setHoverT(null)}
      >
        <defs>
          {lines.map((l) => (
            <linearGradient key={l.key} id={`${gradId}-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={l.color} stopOpacity="0" />
            </linearGradient>
          ))}
          {/* Masque de révélation : le rect grandit de gauche à droite (clé =
             animKey → rejoué quand une nouvelle courbe apparaît). */}
          <clipPath id={`${gradId}-reveal`}>
            <rect
              key={animKey}
              className="chart-reveal-rect"
              x={PAD.left}
              y={0}
              width={Math.max(0, innerW + PAD.right)}
              height={height}
            />
          </clipPath>
        </defs>

        {/* grille horizontale + labels € */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={sy(v)}
              y2={sy(v)}
              stroke="rgba(255,255,255,0.06)"
            />
            <text x={PAD.left - 8} y={sy(v) + 4} textAnchor="end" className="fill-muted" fontSize="10">
              {compactEur(v)}
            </text>
          </g>
        ))}

        {/* labels dates */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={sx(t)}
            y={height - 8}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            className="fill-muted"
            fontSize="10"
          >
            {formatDate(t)}
          </text>
        ))}

        {/* aires + courbes — révélées ensemble par le masque animé (balayage
            gauche→droite). */}
        <g clipPath={`url(#${gradId}-reveal)`}>
          {lines.map((l) => {
            if (l.points.length === 0) return null;
            const d = pathFor(l.points);
            const area =
              l.fill && l.points.length > 1
                ? `${d} L ${sx(l.points[l.points.length - 1].t).toFixed(1)} ${sy(0).toFixed(
                    1
                  )} L ${sx(l.points[0].t).toFixed(1)} ${sy(0).toFixed(1)} Z`
                : null;
            return (
              <g key={l.key}>
                {area ? <path d={area} fill={`url(#${gradId}-${l.key})`} /> : null}
                <path
                  d={d}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={2}
                  strokeDasharray={l.dashed ? "5 5" : undefined}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={l.dashed ? 0.7 : 1}
                />
              </g>
            );
          })}
        </g>

        {/* curseur de survol */}
        {hover != null && (
          <>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD.top}
              y2={height - PAD.bottom}
              stroke="rgba(255,255,255,0.25)"
            />
            {hoverPoints.map(
              (h) =>
                h.pt && (
                  <circle
                    key={h.line.key}
                    cx={sx(h.pt.t)}
                    cy={sy(h.pt.v)}
                    r={3.5}
                    fill={h.line.color}
                    stroke="#080c16"
                    strokeWidth={1.5}
                  />
                )
            )}
          </>
        )}
      </svg>

      {/* tooltip */}
      {hover != null && hoverPoints.length > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[150px] rounded-lg border border-white/10 bg-surface-elevated/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{
            left: Math.min(Math.max(hoverX + 10, 8), width - 168),
          }}
        >
          <p className="mb-1 font-medium text-white/90">
            {formatDate(hoverPoints[0].pt!.t)}
          </p>
          {hoverPoints.map((h) => (
            <p key={h.line.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: h.line.color }}
                />
                {h.line.label}
              </span>
              <span className="font-medium tabular-nums text-white">
                {formatEur(h.pt!.v)}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
