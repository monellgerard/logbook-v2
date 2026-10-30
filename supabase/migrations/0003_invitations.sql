-- LogBook · enlaces de registro. Ejecutar UNA vez en una pestaña nueva del SQL Editor.
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,                 -- solo se guarda el hash; el enlace se muestra una vez
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  max_uses integer not null default 30 check (max_uses between 1 and 500),
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.invitations enable row level security;
create policy invitations_admin on public.invitations for all using (public.is_admin()) with check (public.is_admin());

-- Consumo atómico de un uso (solo el servidor, con la clave secreta, puede llamarlas)
create function public.use_invitation(p_hash text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update invitations set uses = uses + 1
   where token_hash = p_hash and active and uses < max_uses and (expires_at is null or expires_at > now());
  get diagnostics n = row_count;
  return n > 0;
end $$;
create function public.release_invitation(p_hash text) returns void
language sql security definer set search_path = public as $$
  update invitations set uses = greatest(uses - 1, 0) where token_hash = p_hash;
$$;
revoke all on function public.use_invitation(text), public.release_invitation(text) from public, anon, authenticated;
grant execute on function public.use_invitation(text), public.release_invitation(text) to service_role;
