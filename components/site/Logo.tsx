export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg btn-gold text-[15px] font-extrabold">
        S
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold leading-none text-white">
          S&apos;investir{" "}
          <span className="font-normal text-muted">Simulateurs</span>
        </span>
      )}
    </span>
  );
}
