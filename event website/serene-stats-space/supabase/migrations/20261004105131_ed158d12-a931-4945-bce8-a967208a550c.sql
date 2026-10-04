create policy "public read approved suppliers" on public.supplier_profiles for select to anon, authenticated using (status = 'approved');
grant select on public.supplier_profiles to anon;
create policy "public read active packages" on public.supplier_packages for select to anon, authenticated
  using (is_active and exists (select 1 from public.supplier_profiles s where s.id = supplier_id and s.status='approved'));
grant select on public.supplier_packages to anon;
create policy "public read venues" on public.venues for select to anon, authenticated
  using (exists (select 1 from public.supplier_profiles s where s.id = supplier_id and s.status='approved'));
grant select on public.venues to anon;
create or replace function public.blocked_dates(_sid uuid) returns setof date language sql stable security definer set search_path=public as $$
  select date from public.availability where supplier_id=_sid and is_blocked and date >= current_date
  union select event_date from public.events where supplier_id=_sid and status in ('pending','confirmed') and event_date >= current_date
$$;
grant execute on function public.blocked_dates(uuid) to anon, authenticated;
create or replace function public.guard_event_insert() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.event_date < current_date then raise exception 'date in past'; end if;
  if exists (select 1 from public.blocked_dates(new.supplier_id) d where d = new.event_date) then raise exception 'date unavailable'; end if;
  if not exists (select 1 from public.supplier_profiles where id=new.supplier_id and status='approved') then raise exception 'supplier not available'; end if;
  new.status := 'pending';
  return new;
end $$;
create trigger guard_event_insert before insert on public.events for each row execute function public.guard_event_insert();