/**
 * Stockage des simulations sauvegardées.
 *
 * Deux backends, transparents pour l'UI :
 *   - Supabase (auth + RLS) si configuré ET utilisateur connecté
 *   - repli localStorage sinon → la démo fonctionne sans backend
 */
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Frequency } from "@/lib/backtest";

const LOCAL_KEY = "sinvestir.simulations";

export interface SavedSimulation {
  id: string;
  created_at: string;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  params: { amount: number; frequency: Frequency; start: number; end: number };
  result: { totalInvested: number; finalValue: number; profit: number; profitPct: number };
}

export type StoreMode = "supabase" | "local";

async function currentUserId(): Promise<string | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

/** Mode effectif : supabase seulement si configuré ET connecté. */
export async function getStoreMode(): Promise<StoreMode> {
  if (!isSupabaseConfigured) return "local";
  const uid = await currentUserId();
  return uid ? "supabase" : "local";
}

export async function getUserEmail(): Promise<string | null> {
  const sb = getSupabaseBrowser();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.email ?? null;
}

export async function signInWithEmail(email: string): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) throw new Error("Supabase non configuré");
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/mes-simulations" : undefined },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const sb = getSupabaseBrowser();
  await sb?.auth.signOut();
}

// ── localStorage helpers ──
function readLocal(): SavedSimulation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocal(list: SavedSimulation[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export async function listSimulations(): Promise<SavedSimulation[]> {
  if ((await getStoreMode()) === "supabase") {
    const sb = getSupabaseBrowser()!;
    const { data, error } = await sb
      .from("simulations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SavedSimulation[];
  }
  return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function saveSimulation(
  input: Omit<SavedSimulation, "id" | "created_at">
): Promise<SavedSimulation> {
  if ((await getStoreMode()) === "supabase") {
    const sb = getSupabaseBrowser()!;
    const { data, error } = await sb.from("simulations").insert(input).select().single();
    if (error) throw error;
    return data as SavedSimulation;
  }
  const record: SavedSimulation = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  writeLocal([record, ...readLocal()]);
  return record;
}

export async function deleteSimulation(id: string): Promise<void> {
  if ((await getStoreMode()) === "supabase") {
    const sb = getSupabaseBrowser()!;
    const { error } = await sb.from("simulations").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((s) => s.id !== id));
}
