-- LogBook · checklist de material personal. Ejecutar UNA vez en una pestaña nueva del SQL Editor.
create table public.equipment_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  checked boolean not null default false,
  created_at timestamptz not null default now()
);
create index equipment_items_user_idx on public.equipment_items (user_id);
alter table public.equipment_items enable row level security;
-- Privado: cada alumno solo ve y gestiona su propio material.
create policy equipment_own on public.equipment_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
