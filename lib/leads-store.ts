/**
 * Capture de leads (email) au pic d'émotion d'une simulation.
 * → Supabase si configuré (table `leads`, insertion anonyme autorisée par RLS),
 *   sinon repli localStorage pour que la démo démontre quand même le mécanisme.
 *
 * En production : brancher un envoi d'email transactionnel (Resend/Brevo) + une
 * synchro CRM (HubSpot) sur les insertions de cette table.
 */
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Frequency } from "@/lib/backtest";

const LOCAL_KEY = "sinvestir.leads";

export interface LeadInput {
  email: string;
  coin_id: string;
  coin_name: string;
  params: { amount: number; frequency: Frequency; start: number; end: number };
  result: { totalInvested: number; finalValue: number; profit: number; profitPct: number };
  source?: string;
}

export async function saveLead(input: LeadInput): Promise<void> {
  const payload = { ...input, source: input.source ?? "simulateur-crypto" };

  if (isSupabaseConfigured) {
    const sb = getSupabaseBrowser();
    if (sb) {
      const { error } = await sb.from("leads").insert(payload);
      if (error) throw error;
      return;
    }
  }

  // Repli local : le lead est capté côté navigateur (mécanisme démontré).
  if (typeof window !== "undefined") {
    const prev = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]");
    prev.unshift({ ...payload, created_at: new Date().toISOString() });
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(prev));
  }
}
