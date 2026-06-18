-- Table des simulations sauvegardées + sécurité au niveau ligne (RLS).
-- À exécuter dans l'éditeur SQL de Supabase.

create table if not exists public.simulations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  coin_id     text not null,
  coin_name   text not null,
  coin_symbol text not null,
  params      jsonb not null,   -- { amount, frequency, start, end }
  result      jsonb not null    -- { totalInvested, finalValue, profit, profitPct }
);

alter table public.simulations enable row level security;

-- Chaque utilisateur ne voit / écrit / supprime que ses propres simulations.
create policy "select own simulations"
  on public.simulations for select
  using (auth.uid() = user_id);

create policy "insert own simulations"
  on public.simulations for insert
  with check (auth.uid() = user_id);

create policy "delete own simulations"
  on public.simulations for delete
  using (auth.uid() = user_id);

create index if not exists simulations_user_created_idx
  on public.simulations (user_id, created_at desc);
