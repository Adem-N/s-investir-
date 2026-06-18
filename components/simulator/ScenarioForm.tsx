"use client";

import { FREQUENCIES, type Frequency } from "@/lib/backtest";
import type { Coin, Scenario } from "@/lib/types";
import { formatDate, fromISODate, toISODate } from "@/lib/format";
import { CryptoPicker } from "./CryptoPicker";
import { Field, inputClass } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";

export function ScenarioForm({
  scenario,
  coins,
  range,
  onChange,
  accent,
  badge,
  onRemove,
}: {
  scenario: Scenario;
  coins: Coin[];
  range?: { from: number; to: number };
  onChange: (patch: Partial<Scenario>) => void;
  accent?: string;
  badge?: string;
  onRemove?: () => void;
}) {
  const amountLabel =
    FREQUENCIES.find((f) => f.value === scenario.frequency)?.amountLabel ?? "Montant";
  const minISO = range ? toISODate(range.from) : undefined;
  const maxISO = range ? toISODate(range.to) : undefined;

  return (
    <div className="space-y-4">
      {badge ? (
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold"
            style={{ background: `${accent}22`, color: accent }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            {badge}
          </span>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-muted transition hover:text-loss"
            >
              Retirer
            </button>
          ) : null}
        </div>
      ) : null}

      <Field label="Cryptomonnaie">
        <CryptoPicker
          coins={coins}
          value={scenario.coinId}
          onChange={(id) => onChange({ coinId: id })}
        />
      </Field>

      <Field label="Fréquence d'investissement">
        <Segmented<Frequency>
          options={FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))}
          value={scenario.frequency}
          onChange={(frequency) => onChange({ frequency })}
        />
      </Field>

      <Field
        label={amountLabel}
        hint={
          scenario.frequency === "once"
            ? "Somme investie en une seule fois."
            : "Versement récurrent (DCA)."
        }
      >
        <div className="relative">
          <input
            type="number"
            min={1}
            step={10}
            value={Number.isFinite(scenario.amount) ? scenario.amount : ""}
            onChange={(e) => onChange({ amount: Math.max(0, Number(e.target.value)) })}
            className={`${inputClass} pr-9`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            €
          </span>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date de début">
          <input
            type="date"
            value={toISODate(scenario.start)}
            min={minISO}
            max={toISODate(scenario.end)}
            onChange={(e) => onChange({ start: fromISODate(e.target.value) })}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
        <Field label="Date de fin">
          <input
            type="date"
            value={toISODate(scenario.end)}
            min={toISODate(scenario.start)}
            max={maxISO}
            onChange={(e) => onChange({ end: fromISODate(e.target.value) })}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
      </div>

      {range ? (
        <p className="text-[11px] text-muted/80">
          Données disponibles du {formatDate(range.from)} au {formatDate(range.to)}.
        </p>
      ) : null}
    </div>
  );
}
