-- =====================================================================
-- EventPlace dashboard sync script
-- Run ONCE in your Supabase SQL Editor (on the database your mobile app uses).
-- It does NOT create or change your existing tables/columns. It only adds:
--   * user_roles (if missing) + role helpers
--   * automatic rules: date holding, booking status history, supplier approval guard
--   * security rules (RLS) the admin + supplier dashboards need
-- Safe to run more than once.
-- =====================================================================

-- ---------- roles ----------
do $$ begin
  create type public.app_role as enum ('admin','supplier','customer');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.owns_supplier(_sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.supplier_profiles where id = _sid and user_id = auth.uid())
$$;

create or replace function public.supplier_is_approved(_sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.supplier_profiles where id = _sid and verification_status = 'approved')
$$;

create or replace function public.owns_venue(_vid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.venues v join public.supplier_profiles s on s.id = v.supplier_id
                 where v.id = _vid and s.user_id = auth.uid())
$$;

create or replace function public.owns_artist(_aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.artists a join public.supplier_profiles s on s.id = a.supplier_id
                 where a.id = _aid and s.user_id = auth.uid())
$$;

-- a supplier may see the profile (name/phone) of customers who sent them a booking request
create or replace function public.is_my_customer(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.booking_requests b join public.supplier_profiles s on s.id = b.supplier_id
                 where b.customer_id = _uid and s.user_id = auth.uid())
$$;

-- a supplier may see the customer's event linked to a booking request sent to them
create or replace function public.event_visible_to_supplier(_eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.booking_requests b join public.supplier_profiles s on s.id = b.supplier_id
                 where b.event_id = _eid and s.user_id = auth.uid())
$$;

-- ---------- dates that can't be booked (public: returns dates only) ----------
create or replace function public.taken_dates(_sid uuid)
returns setof date language sql stable security definer set search_path = public as $$
  select date from public.availability
   where supplier_id = _sid and status in ('blocked','booked') and date >= current_date
  union
  select event_date from public.booking_requests
   where supplier_id = _sid and status in ('requested','quoted','confirmed') and event_date >= current_date
$$;
grant execute on function public.taken_dates(uuid) to anon, authenticated;

-- ---------- supplier: new profile gets the supplier role; only admin approves ----------
create or replace function public.ep_supplier_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then new.verification_status := 'pending'; end if;
  if new.user_id is not null then
    insert into public.user_roles(user_id, role) values (new.user_id, 'supplier') on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists ep_supplier_insert on public.supplier_profiles;
create trigger ep_supplier_insert before insert on public.supplier_profiles
  for each row execute function public.ep_supplier_insert();

create or replace function public.ep_supplier_status_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.verification_status is distinct from old.verification_status
      or new.is_verified is distinct from old.is_verified
      or new.is_featured is distinct from old.is_featured)
     and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can change supplier approval';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists ep_supplier_status_guard on public.supplier_profiles;
create trigger ep_supplier_status_guard before update on public.supplier_profiles
  for each row execute function public.ep_supplier_status_guard();

-- ---------- booking requests: hold the date, guard changes, keep history ----------
create or replace function public.ep_booking_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.event_date < current_date then raise exception 'date in past'; end if;
  if not public.supplier_is_approved(new.supplier_id) then raise exception 'supplier not available'; end if;
  if exists (select 1 from public.taken_dates(new.supplier_id) d where d = new.event_date) then
    raise exception 'date unavailable';
  end if;
  new.status := 'requested';
  return new;
end $$;
drop trigger if exists ep_booking_insert on public.booking_requests;
create trigger ep_booking_insert before insert on public.booking_requests
  for each row execute function public.ep_booking_insert();

create or replace function public.ep_booking_update_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- customers (not the supplier, not admin) may only cancel their own request
  if not public.owns_supplier(old.supplier_id) and not public.has_role(auth.uid(), 'admin') then
    if new.status is distinct from old.status and new.status <> 'cancelled' then
      raise exception 'customers can only cancel';
    end if;
    if new.supplier_id <> old.supplier_id or new.event_date <> old.event_date then
      raise exception 'cannot change supplier or date';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists ep_booking_update_guard on public.booking_requests;
create trigger ep_booking_update_guard before update on public.booking_requests
  for each row execute function public.ep_booking_update_guard();

create or replace function public.ep_booking_status_sync()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history(booking_request_id, previous_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
    return new;
  end if;
  if new.status is distinct from old.status then
    insert into public.booking_status_history(booking_request_id, previous_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
    if new.status = 'confirmed' then
      delete from public.availability where supplier_id = new.supplier_id and date = new.event_date;
      insert into public.availability(supplier_id, date, status, note)
      values (new.supplier_id, new.event_date, 'booked', 'booking:' || new.id);
    elsif new.status in ('rejected','cancelled') then
      delete from public.availability
       where supplier_id = new.supplier_id and date = new.event_date and status = 'booked'
         and note = 'booking:' || new.id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ep_booking_status_sync on public.booking_requests;
create trigger ep_booking_status_sync after insert or update on public.booking_requests
  for each row execute function public.ep_booking_status_sync();

revoke execute on function public.ep_supplier_insert(), public.ep_supplier_status_guard(),
  public.ep_booking_insert(), public.ep_booking_update_guard(), public.ep_booking_status_sync()
  from anon, authenticated, public;

-- ---------- grants ----------
grant select on public.regions, public.cities, public.supplier_types, public.service_categories,
  public.amenities, public.genres, public.event_types, public.supplier_profiles, public.venues,
  public.artists, public.venue_amenities, public.artist_genres, public.supplier_packages,
  public.media, public.supplier_service_areas, public.availability to anon;
grant select, insert, update, delete on public.regions, public.cities, public.supplier_types,
  public.service_categories, public.amenities, public.genres, public.event_types, public.profiles,
  public.supplier_profiles, public.venues, public.artists, public.venue_amenities, public.artist_genres,
  public.supplier_packages, public.media, public.supplier_service_areas, public.availability,
  public.booking_requests, public.booking_status_history, public.events to authenticated;
grant all on public.regions, public.cities, public.supplier_types, public.service_categories,
  public.amenities, public.genres, public.event_types, public.profiles, public.supplier_profiles,
  public.venues, public.artists, public.venue_amenities, public.artist_genres, public.supplier_packages,
  public.media, public.supplier_service_areas, public.availability, public.booking_requests,
  public.booking_status_history, public.events to service_role;

-- ---------- security rules ----------
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.supplier_types enable row level security;
alter table public.service_categories enable row level security;
alter table public.amenities enable row level security;
alter table public.genres enable row level security;
alter table public.event_types enable row level security;
alter table public.profiles enable row level security;
alter table public.supplier_profiles enable row level security;
alter table public.venues enable row level security;
alter table public.artists enable row level security;
alter table public.venue_amenities enable row level security;
alter table public.artist_genres enable row level security;
alter table public.supplier_packages enable row level security;
alter table public.media enable row level security;
alter table public.supplier_service_areas enable row level security;
alter table public.availability enable row level security;
alter table public.booking_requests enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.events enable row level security;

-- user_roles
drop policy if exists "ep read own roles" on public.user_roles;
create policy "ep read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep admin manage roles" on public.user_roles;
create policy "ep admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- lookup lists: everyone reads, admin edits
do $$ declare t text; begin
  foreach t in array array['regions','cities','supplier_types','service_categories','amenities','genres','event_types'] loop
    execute format('drop policy if exists "ep read %1$s" on public.%1$I', t);
    execute format('create policy "ep read %1$s" on public.%1$I for select using (true)', t);
    execute format('drop policy if exists "ep admin write %1$s" on public.%1$I', t);
    execute format('create policy "ep admin write %1$s" on public.%1$I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t);
  end loop;
end $$;

-- profiles
drop policy if exists "ep own profile" on public.profiles;
create policy "ep own profile" on public.profiles for all to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep supplier sees customers" on public.profiles;
create policy "ep supplier sees customers" on public.profiles for select to authenticated
  using (public.is_my_customer(id));

-- supplier_profiles
drop policy if exists "ep public approved suppliers" on public.supplier_profiles;
create policy "ep public approved suppliers" on public.supplier_profiles for select
  using (verification_status = 'approved');
drop policy if exists "ep owner or admin read supplier" on public.supplier_profiles;
create policy "ep owner or admin read supplier" on public.supplier_profiles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep supplier insert self" on public.supplier_profiles;
create policy "ep supplier insert self" on public.supplier_profiles for insert to authenticated
  with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep supplier update own" on public.supplier_profiles;
create policy "ep supplier update own" on public.supplier_profiles for update to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep admin delete supplier" on public.supplier_profiles;
create policy "ep admin delete supplier" on public.supplier_profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- supplier-owned tables: public reads for approved suppliers, owner/admin edit
do $$ declare t text; begin
  foreach t in array array['venues','artists','supplier_packages','media','supplier_service_areas','availability'] loop
    execute format('drop policy if exists "ep public read %1$s" on public.%1$I', t);
    execute format('create policy "ep public read %1$s" on public.%1$I for select using (public.supplier_is_approved(supplier_id))', t);
    execute format('drop policy if exists "ep owner %1$s" on public.%1$I', t);
    execute format('create policy "ep owner %1$s" on public.%1$I for all to authenticated using (public.owns_supplier(supplier_id) or public.has_role(auth.uid(), ''admin'')) with check (public.owns_supplier(supplier_id) or public.has_role(auth.uid(), ''admin''))', t);
  end loop;
end $$;

drop policy if exists "ep public read venue_amenities" on public.venue_amenities;
create policy "ep public read venue_amenities" on public.venue_amenities for select using (true);
drop policy if exists "ep owner venue_amenities" on public.venue_amenities;
create policy "ep owner venue_amenities" on public.venue_amenities for all to authenticated
  using (public.owns_venue(venue_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.owns_venue(venue_id) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep public read artist_genres" on public.artist_genres;
create policy "ep public read artist_genres" on public.artist_genres for select using (true);
drop policy if exists "ep owner artist_genres" on public.artist_genres;
create policy "ep owner artist_genres" on public.artist_genres for all to authenticated
  using (public.owns_artist(artist_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.owns_artist(artist_id) or public.has_role(auth.uid(), 'admin'));

-- booking_requests
drop policy if exists "ep booking read" on public.booking_requests;
create policy "ep booking read" on public.booking_requests for select to authenticated
  using (customer_id = auth.uid() or public.owns_supplier(supplier_id) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep booking insert" on public.booking_requests;
create policy "ep booking insert" on public.booking_requests for insert to authenticated
  with check (customer_id = auth.uid());
drop policy if exists "ep booking update" on public.booking_requests;
create policy "ep booking update" on public.booking_requests for update to authenticated
  using (customer_id = auth.uid() or public.owns_supplier(supplier_id) or public.has_role(auth.uid(), 'admin'))
  with check (customer_id = auth.uid() or public.owns_supplier(supplier_id) or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep booking delete" on public.booking_requests;
create policy "ep booking delete" on public.booking_requests for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- booking_status_history (written automatically)
drop policy if exists "ep history read" on public.booking_status_history;
create policy "ep history read" on public.booking_status_history for select to authenticated
  using (exists (select 1 from public.booking_requests b where b.id = booking_request_id));

-- events (the customer's own event plan)
drop policy if exists "ep own events" on public.events;
create policy "ep own events" on public.events for all to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
drop policy if exists "ep supplier sees event" on public.events;
create policy "ep supplier sees event" on public.events for select to authenticated
  using (public.event_visible_to_supplier(id));
