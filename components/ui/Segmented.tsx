import { cn } from "@/lib/cn";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const index = options.findIndex((o) => o.value === value);

  const move = (dir: 1 | -1) => {
    const n = options.length;
    onChange(options[(index + dir + n) % n].value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
      className={cn(
        "inline-flex w-full gap-1 rounded-xl border border-white/8 bg-black/30 p-1",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:outline-none",
              active
                ? "bg-brand text-white shadow-[0_6px_18px_-8px_rgba(16,152,247,0.9)]"
                : "text-muted hover:text-white"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
