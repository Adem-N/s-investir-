export const inputClass =
  "w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white placeholder:text-muted/60 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/25 transition";

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-muted"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-muted/80">{hint}</p>
      ) : null}
    </div>
  );
}
