-- LogBook · fotos de perfil con aprobación del profesor. Ejecutar UNA vez, en una pestaña nueva del SQL Editor.

create type photo_status as enum ('pending', 'approved', 'rejected');
create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path text not null,
  status photo_status not null default 'pending',
  reject_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index one_pending_photo on public.profile_photos (user_id) where status = 'pending';
alter table public.profile_photos enable row level security;
create policy photos_select on public.profile_photos for select using (user_id = auth.uid() or public.is_admin());
create policy photos_insert on public.profile_photos for insert
  with check (user_id = auth.uid() and status = 'pending' and path like auth.uid()::text || '/%');
create policy photos_delete on public.profile_photos for delete using (user_id = auth.uid() and status <> 'approved');
create policy photos_review on public.profile_photos for update using (public.is_admin()) with check (public.is_admin());

-- Al revisar: se registra quién y cuándo; si se aprueba, pasa a ser la foto visible del perfil.
create function public.photo_reviewed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status <> old.status then
    new.reviewed_by = auth.uid(); new.reviewed_at = now();
    if new.status = 'approved' then update profiles set avatar_path = new.path where id = new.user_id; end if;
  end if;
  return new;
end $$;
create trigger photos_review_t before update on public.profile_photos for each row execute function public.photo_reviewed();

-- Un alumno no puede asignarse una foto «aprobada» editando su perfil.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.active is distinct from old.active or new.avatar_path is distinct from old.avatar_path) then
    raise exception 'No autorizado para modificar rol, estado de la cuenta o foto aprobada';
  end if;
  new.updated_at = now();
  return new;
end $$;

-- Almacenamiento privado (máx. 2 MB; solo JPG, PNG o WebP)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy avatars_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy avatars_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and exists (select 1 from public.profile_photos p where p.path = name and p.user_id = auth.uid() and p.status <> 'approved'));
