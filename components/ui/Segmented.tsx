import { cn } from "@/lib/cn";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
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
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all",
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
