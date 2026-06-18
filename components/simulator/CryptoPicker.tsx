"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Coin } from "@/lib/types";
import { cn } from "@/lib/cn";

function CoinLogo({ coin, size = 22 }: { coin?: Coin; size?: number }) {
  if (coin?.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={coin.image}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="rounded-full"
      />
    );
  }
  return (
    <span
      className="grid place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white"
      style={{ width: size, height: size }}
    >
      {coin?.symbol?.[0] ?? "?"}
    </span>
  );
}

export function CryptoPicker({
  coins,
  value,
  onChange,
}: {
  coins: Coin[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = coins.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? coins.filter(
          (c) =>
            c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
        )
      : coins;
    return list.slice(0, 60);
  }, [coins, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3 text-left transition hover:border-white/20 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25"
      >
        <CoinLogo coin={selected} />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-white">
            {selected?.name ?? "Choisir une crypto"}
          </span>
          {selected ? (
            <span className="text-xs text-muted">{selected.symbol}</span>
          ) : null}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0 text-muted" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-surface-elevated/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/8 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (Bitcoin, ETH…)"
              className="h-9 w-full rounded-lg bg-black/40 px-3 text-sm text-white placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === value}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                    c.id === value ? "bg-brand/15" : "hover:bg-white/5"
                  )}
                >
                  <CoinLogo coin={c} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">{c.name}</span>
                    <span className="text-xs text-muted">{c.symbol}</span>
                  </span>
                  {c.hasHistory ? (
                    <span className="rounded-md bg-gain/15 px-1.5 py-0.5 text-[10px] font-medium text-gain">
                      historique complet
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-muted">
                      ≤ 1 an
                    </span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted">
                Aucune crypto trouvée
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
