-- LogBook · el profesor no puede revisar sus propias inmersiones. Ejecutar UNA vez en un snippet nuevo del SQL Editor.
drop policy if exists reviews_insert on public.dive_reviews;
create policy reviews_insert on public.dive_reviews for insert
  with check (public.is_admin() and reviewer_id = auth.uid()
    and not exists (select 1 from public.dives d where d.id = dive_id and d.user_id = auth.uid()));
