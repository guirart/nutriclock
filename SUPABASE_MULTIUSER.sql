-- Execute no SQL Editor do Supabase antes do deploy multiusuário.

alter table public.nutrition_entries
  alter column user_id type text using user_id::text;

create index if not exists nutrition_entries_user_date_idx
  on public.nutrition_entries (user_id, occurred_at desc);

-- As rotas do Next.js usam a service role no servidor e validam o JWT antes de consultar.
-- Bloqueia acesso direto anônimo à tabela.
alter table public.nutrition_entries enable row level security;

drop policy if exists "users_read_own_entries" on public.nutrition_entries;
create policy "users_read_own_entries"
on public.nutrition_entries for select
to authenticated
using (user_id = auth.uid()::text);

drop policy if exists "users_insert_own_entries" on public.nutrition_entries;
create policy "users_insert_own_entries"
on public.nutrition_entries for insert
to authenticated
with check (user_id = auth.uid()::text);

drop policy if exists "users_update_own_entries" on public.nutrition_entries;
create policy "users_update_own_entries"
on public.nutrition_entries for update
to authenticated
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

drop policy if exists "users_delete_own_entries" on public.nutrition_entries;
create policy "users_delete_own_entries"
on public.nutrition_entries for delete
to authenticated
using (user_id = auth.uid()::text);
