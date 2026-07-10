create extension if not exists pgcrypto;

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null check (type in ('meal','exercise','water','caffeine','weight')),
  description text not null,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric not null default 0,
  water_ml numeric not null default 0,
  caffeine_mg numeric not null default 0,
  weight_kg numeric,
  confidence text not null default 'medium' check (confidence in ('high','medium','low')),
  notes text,
  source text not null default 'chatgpt',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists nutrition_entries_user_date_idx
on public.nutrition_entries (user_id, occurred_at desc);

alter table public.nutrition_entries enable row level security;

-- Nenhuma policy pública é criada.
-- O app acessa esta tabela apenas pelo backend usando a Service Role Key.
