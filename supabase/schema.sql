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


-- ──────────────────────────────────────────────────────────────
-- Leads (capture email au pic d'émotion d'une simulation).
-- Branchez un email transactionnel + le CRM (HubSpot) sur les insertions.
-- ──────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  coin_id     text,
  coin_name   text,
  params      jsonb,   -- { amount, frequency, start, end }
  result      jsonb,   -- { totalInvested, finalValue, profit, profitPct }
  source      text
);

alter table public.leads enable row level security;

-- Capture anonyme : tout le monde peut INSÉRER un lead (visiteur non connecté),
-- mais PERSONNE ne peut lire la table via l'API publique (aucune policy select)
-- → seules les clés service role (back-office) y accèdent. Privacy by design.
create policy "anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create index if not exists leads_created_idx on public.leads (created_at desc);
