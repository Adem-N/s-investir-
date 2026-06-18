"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteSimulation,
  getStoreMode,
  getUserEmail,
  listSimulations,
  signInWithEmail,
  signOut,
  type SavedSimulation,
  type StoreMode,
} from "@/lib/simulations-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { FREQUENCIES } from "@/lib/backtest";
import { formatDate, formatEur, formatPct, formatSignedEur } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export function SavedList() {
  const [items, setItems] = useState<SavedSimulation[] | null>(null);
  const [mode, setMode] = useState<StoreMode>("local");
  const [email, setEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function refresh() {
    setMode(await getStoreMode());
    setEmail(await getUserEmail());
    setItems(await listSimulations());
  }

  useEffect(() => {
    refresh().catch(() => setItems([]));
  }, []);

  async function handleDelete(id: string) {
    await deleteSimulation(id);
    setItems((it) => it?.filter((s) => s.id !== id) ?? null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await signInWithEmail(loginEmail);
    setSent(true);
  }

  return (
    <div className="space-y-5">
      {/* Bandeau auth / mode */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {mode === "supabase" ? (
            <p className="text-white">
              Connecté{email ? ` — ${email}` : ""}{" "}
              <span className="text-muted">(synchronisé via Supabase)</span>
            </p>
          ) : (
            <p className="text-muted">
              Simulations stockées <span className="text-white">localement sur cet appareil</span>
              {isSupabaseConfigured ? " — connectez-vous pour les synchroniser." : "."}
            </p>
          )}
        </div>

        {isSupabaseConfigured && mode === "supabase" ? (
          <Button variant="outline" size="sm" onClick={() => signOut().then(refresh)}>
            Se déconnecter
          </Button>
        ) : isSupabaseConfigured && !sent ? (
          <form onSubmit={handleLogin} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="email@exemple.fr"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={cn(inputClass, "h-9 w-48")}
            />
            <Button variant="primary" size="sm" type="submit">
              Lien magique
            </Button>
          </form>
        ) : isSupabaseConfigured && sent ? (
          <p className="text-xs text-gain">Lien envoyé ✓ vérifiez vos emails.</p>
        ) : null}
      </Card>

      {/* Liste */}
      {items === null ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner /> Chargement…
        </div>
      ) : items.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-10 text-center">
          <p className="text-muted">Aucune simulation sauvegardée pour le moment.</p>
          <Link href="/">
            <Button variant="gold" size="sm">
              Lancer une simulation
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((s) => {
            const positive = s.result.profit >= 0;
            const freq = FREQUENCIES.find((f) => f.value === s.params.frequency)?.label;
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">
                      {s.coin_name}{" "}
                      <span className="text-xs text-muted">{s.coin_symbol}</span>
                    </p>
                    <p className="text-xs text-muted">
                      {formatEur(s.params.amount)} · {freq} · {formatDate(s.params.start)} →{" "}
                      {formatDate(s.params.end)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs text-muted transition hover:text-loss"
                    aria-label="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <span className={cn("text-lg font-bold tabular-nums", positive ? "text-gain" : "text-loss")}>
                    {formatSignedEur(s.result.profit)}
                  </span>
                  <span className={cn("text-sm font-medium tabular-nums", positive ? "text-gain" : "text-loss")}>
                    {formatPct(s.result.profitPct)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
