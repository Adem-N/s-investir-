import { cn } from "@/lib/cn";

type Tone = "default" | "gain" | "loss" | "brand" | "gold";

const TONES: Record<Tone, string> = {
  default: "text-white",
  gain: "text-gain",
  loss: "text-loss",
  brand: "text-brand",
  gold: "text-gold",
};

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  emphasis = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums leading-tight",
          emphasis ? "text-2xl sm:text-[28px]" : "text-lg",
          TONES[tone]
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
